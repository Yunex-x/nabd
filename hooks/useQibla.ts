import getQiblaBearing from "@/utils/getQiblaBearing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";

type QiblaState = {
  loading: boolean;
  error?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  /** declination in degrees (magnetic -> true). positive = east */
  declination?: number | null;
  /** corrected heading (true heading) in degrees [0..360) */
  heading?: number | null;
  /** bearing to Kaaba (true) in degrees [0..360) */
  qiblaBearing?: number | null;
  distanceKm?: number | null;
};

const KAABA = { lat: 21.4225, lon: 39.8262 };

/** Haversine distance (km) */
function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; // km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Compute decimal year for NOAA WMM request (e.g., 2026.25) */
function decimalYear(date = new Date()) {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  const frac = (date.getTime() - start) / (end - start);
  return year + frac;
}

/** Cache declination responses for a short period to reduce network calls. */
const DECL_CACHE_PREFIX = "wmm_decl_v1:";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function fetchDeclinationFromCache(key: string) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (Date.now() - (parsed.ts || 0) > CACHE_TTL_MS) {
      await AsyncStorage.removeItem(key).catch(() => {});
      return null;
    }
    return parsed.decl;
  } catch {
    return null;
  }
}

async function storeDeclinationToCache(key: string, decl: number) {
  try {
    const payload = { decl, ts: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

/**
 * Query NOAA WMM REST service to get declination (magnetic variation).
 * Uses: https://www.ngdc.noaa.gov/geomag-web/calculators/calculateWMM
 *
 * Returns declination in degrees (positive east), or null on failure.
 */
async function fetchDeclinationNOAA(
  lat: number,
  lon: number,
  when = new Date(),
): Promise<number | null> {
  try {
    const yearDecimal = decimalYear(when);
    const rlat = Math.round(lat * 100) / 100; // 0.01 ~ 1.1 km
    const rlon = Math.round(lon * 100) / 100;
    const key = `${DECL_CACHE_PREFIX}${rlat}:${rlon}:${Math.floor(yearDecimal)}`;

    const cached = await fetchDeclinationFromCache(key);
    if (cached != null) return cached;

    const url = `https://www.ngdc.noaa.gov/geomag-web/calculators/calculateWMM?lat1=${encodeURIComponent(
      lat,
    )}&lon1=${encodeURIComponent(lon)}&startYear=${encodeURIComponent(yearDecimal)}&resultFormat=json&model=WMM`;

    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) return null;

    const data = await resp.json();
    const res = Array.isArray(data?.result) ? data.result[0] : data?.result;
    let decl: number | null = null;

    if (res) {
      if (typeof res.declination === "number") decl = res.declination;
      else if (typeof res.decl === "number") decl = res.decl;
      else if (typeof res.dec === "number") decl = res.dec;
      else if (typeof res.D === "number") decl = res.D;
      else if (typeof res.result?.declination === "number")
        decl = res.result.declination;
      else {
        for (const k of ["declination", "decl", "dec", "D"]) {
          if (k in res) {
            const v = Number((res as any)[k]);
            if (!Number.isNaN(v)) {
              decl = v;
              break;
            }
          }
        }
      }
    }

    if (decl != null) {
      await storeDeclinationToCache(key, decl);
      return decl;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * useQibla hook
 * - obtains user location
 * - fetches geomagnetic declination (NOAA WMM) and caches it
 * - subscribes to magnetometer and outputs corrected true heading
 * - computes qibla bearing using getQiblaBearing (great-circle formula you provided)
 */
export function useQibla(options?: {
  magnetometerIntervalMs?: number;
  smooth?: number;
}) {
  const [state, setState] = useState<QiblaState>({
    loading: true,
    error: null,
    latitude: null,
    longitude: null,
    declination: null,
    heading: null,
    qiblaBearing: null,
    distanceKm: null,
  });

  const magnetometerSub = useRef<any>(null);
  const smooth = options?.smooth ?? 0.18;

  useEffect(() => {
    let mounted = true;
    let currentDecl: number | null = null;

    async function init() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!mounted) return;
        if (status !== "granted") {
          setState((s) => ({
            ...s,
            loading: false,
            error: "Location permission denied",
          }));
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        if (!mounted) return;

        const { latitude, longitude } = pos.coords;

        // Use the precise great-circle formula utility
        const qiblaBearing = getQiblaBearing(latitude, longitude);
        const distanceKm = haversineDistanceKm(
          latitude,
          longitude,
          KAABA.lat,
          KAABA.lon,
        );

        // fetch declination (may return null on failure)
        const decl = await fetchDeclinationNOAA(
          latitude,
          longitude,
          new Date(),
        );
        currentDecl = decl ?? 0;

        if (!mounted) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
          latitude,
          longitude,
          qiblaBearing,
          distanceKm,
          declination: currentDecl,
        }));
      } catch (e: any) {
        if (!mounted) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: e?.message ?? "Failed to get location",
          declination: null,
        }));
      }
    }

    init();

    const interval = options?.magnetometerIntervalMs ?? 100;
    Magnetometer.setUpdateInterval(interval);

    magnetometerSub.current = Magnetometer.addListener((magData) => {
      if (!mounted) return;
      const { x, y } = magData;
      let magAngle = (Math.atan2(y, x) * 180) / Math.PI;
      if (magAngle < 0) magAngle = 360 + magAngle;

      // Apply smoothing to magnetic angle first
      setState((prev) => {
        // Recover previous raw magnetometer estimate if available (prev.heading was true heading)
        const prevMagEstimate =
          prev.heading != null && prev.declination != null
            ? prev.heading - (prev.declination ?? 0)
            : magAngle;

        const smoothedMag =
          prevMagEstimate + (magAngle - prevMagEstimate) * smooth;

        // Apply declination to get true heading: true = magnetic + declination
        const decl =
          prev.declination != null ? prev.declination : (currentDecl ?? 0);
        let trueHeading = smoothedMag + decl;
        trueHeading = ((trueHeading % 360) + 360) % 360;

        return { ...prev, heading: trueHeading };
      });
    });

    return () => {
      mounted = false;
      if (magnetometerSub.current) {
        magnetometerSub.current.remove();
        magnetometerSub.current = null;
      }
    };
  }, [options?.magnetometerIntervalMs, smooth]);

  return state;
}
