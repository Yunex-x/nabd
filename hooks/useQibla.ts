import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

type QiblaState = {
  loading: boolean;
  error?: string | null;
  latitude?: number;
  longitude?: number;
  heading?: number; // device magnetic heading in degrees [0..360)
  qiblaBearing?: number; // bearing to Kaaba in degrees [0..360)
  distanceKm?: number; // distance to Kaaba
};

const KAABA = { lat: 21.422487, lon: 39.826206 };

/**
 * Calculates initial bearing (forward azimuth) from point A to B in degrees.
 * Formula: atan2( sin Δλ ⋅ cos φ2, cos φ1 ⋅ sin φ2 − sin φ1 ⋅ cos φ2 ⋅ cos Δλ )
 */
function bearingBetween(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let θ = Math.atan2(y, x);
  θ = toDeg(θ);
  return (θ + 360) % 360;
}

/**
 * Haversine distance in kilometers
 */
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

export function useQibla(options?: { magnetometerIntervalMs?: number }) {
  const [state, setState] = useState<QiblaState>({
    loading: true,
    error: null,
  });
  const magnetometerSub = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!mounted) return;
        if (status !== "granted") {
          setState({ loading: false, error: "Location permission denied" });
          return;
        }

        // Get last known / current location
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        if (!mounted) return;

        const { latitude, longitude } = pos.coords;
        const qiblaBearing = bearingBetween(
          latitude,
          longitude,
          KAABA.lat,
          KAABA.lon,
        );
        const distanceKm = haversineDistanceKm(
          latitude,
          longitude,
          KAABA.lat,
          KAABA.lon,
        );

        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
          latitude,
          longitude,
          qiblaBearing,
          distanceKm,
        }));
      } catch (e: any) {
        if (!mounted) return;
        setState({
          loading: false,
          error: e?.message ?? "Failed to get location",
        });
      }
    }

    init();

    // Subscribe to magnetometer for heading updates (native only)
    if (Platform.OS !== "web") {
      const interval = options?.magnetometerIntervalMs ?? 100;
      Magnetometer.setUpdateInterval(interval);

      magnetometerSub.current = Magnetometer.addListener((magData) => {
        if (!mounted) return;
        // Compute heading from magnetometer vector
        const { x, y } = magData;
        // atan2 uses y,x and we convert to degrees and normalize to [0..360)
        let angle = (Math.atan2(y, x) * 180) / Math.PI;
        if (angle < 0) angle = 360 + angle;
        // The computed angle is magnetic heading relative to device axes.
        // Many devices need adjustment (sensor orientation), but this works for most phones.
        setState((prev) => ({ ...prev, heading: angle }));
      });
    }

    return () => {
      mounted = false;
      if (magnetometerSub.current) {
        magnetometerSub.current.remove();
        magnetometerSub.current = null;
      }
    };
  }, [options?.magnetometerIntervalMs]);

  return state;
}
