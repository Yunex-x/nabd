import { useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
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

export function usePrayerTimes(options?: {
  method?: number;
  school?: 0 | 1;
  tune?: string;
}) {
  const { method = 3, school = 0, tune } = options ?? {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [countdown, setCountdown] = useState("00:00:00");

  const timerRef = useRef<any>(null);

  const nextPrayer = useMemo(() => {
    if (!timings) return null;
    return getNextPrayer(timings);
  }, [timings]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") throw new Error("Location permission denied");

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const t = await fetchPrayerTimesByCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          method,
          school, // Morocco: 0 (Shafi/Maliki)
          tune,
        });

        setTimings(t);
      } catch (e: any) {
        setError(e?.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [method, school, tune]);

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