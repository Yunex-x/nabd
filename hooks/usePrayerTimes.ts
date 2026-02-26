import { useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchPrayerTimesByCoords, PrayerTimings } from "@/app/services/prayerTimes";

type PrayerKey = keyof PrayerTimings;

function toDateToday(hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d;
}

function getNextPrayer(t: PrayerTimings) {
  const order: PrayerKey[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const now = new Date();

  for (const key of order) {
    const at = toDateToday(t[key]);
    if (at > now) return { key, at };
  }

  // after Isha => tomorrow Fajr
  const tomorrow = toDateToday(t.Fajr);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { key: "Fajr" as PrayerKey, at: tomorrow };
}

function formatMs(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

// Cache TTL (ms) — adjust for how fresh you want timings to be
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

export function usePrayerTimes(options?: { timeoutMs?: number }) {
  const { timeoutMs = 4000 } = options ?? {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [countdown, setCountdown] = useState("00:00:00");

  const timerRef = useRef<any>(null);

  const nextPrayer = useMemo(() => {
    if (!timings) return null;
    return getNextPrayer(timings);
  }, [timings]);

  // helper: derive timezone with fallback
  function resolveTimeZone(): string | undefined {
    try {
      // Preferred: IANA timezone from Intl
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) return tz;
    } catch (e) {
      // ignore
    }
    // fallback: return undefined (API will infer by coords)
    return undefined;
  }

  // helper: cache key for coordinates + date
  function cacheKeyForCoords(lat: number, lon: number) {
    const latKey = Math.round(lat * 1000);
    const lonKey = Math.round(lon * 1000);
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `prayer_cache_${latKey}_${lonKey}_${date}`;
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Request permission first
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Location permission denied");
        }

        // Try quick path: last known position (fast, may be available)
        let loc = await Location.getLastKnownPositionAsync();
        // If last-known not available, try a fast current position with small timeout and lower accuracy
        if (!loc) {
          try {
            loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
              maximumAge: 1000 * 60 * 5, // accept up to 5 min cached
              timeout: 3000, // fast attempt (3s)
            });
          } catch (e) {
            // fallback to a slightly longer attempt
            loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
              maximumAge: 1000 * 60 * 5,
              timeout: 8000, // longer fallback
            });
          }
        }

        if (!loc) {
          throw new Error("Unable to obtain location");
        }

        const { latitude, longitude } = loc.coords;
        const tz = resolveTimeZone();
        const cacheKey = cacheKeyForCoords(latitude, longitude);

        // Check cache
        try {
          const raw = await AsyncStorage.getItem(cacheKey);
          if (raw) {
            const parsed = JSON.parse(raw) as { ts: number; timings: PrayerTimings };
            if (parsed && Date.now() - parsed.ts < CACHE_TTL_MS) {
              if (!mounted) return;
              setTimings(parsed.timings);
              return;
            }
          }
        } catch (e) {
          // ignore cache errors
        }

        // Not in cache or expired — fetch from API using only coords + timezone
        const fetched = await fetchPrayerTimesByCoords({
          latitude,
          longitude,
          timezone: tz,
          timeoutMs,
        });

        if (!mounted) return;

        setTimings(fetched);

        // store in cache (best-effort)
        try {
          await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify({ ts: Date.now(), timings: fetched })
          );
        } catch (e) {
          // ignore cache write errors
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "Something went wrong");
        setTimings(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [timeoutMs]);

  useEffect(() => {
    if (!nextPrayer) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      const ms = nextPrayer.at.getTime() - Date.now();
      setCountdown(formatMs(ms));
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextPrayer?.at?.getTime()]);

  return {
    loading,
    error,
    timings,
    nextPrayer,
    countdown,
    nextKey: nextPrayer?.key ?? null,
  };
}