import { Coordinates } from "adhan";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelAllPrayerNotifications,
  cancelScheduledByTag,
} from "../services/notifications";
import {
  calculatePrayerTimes,
  getDeviceCoordinates,
  PrayerTimesMap,
} from "../services/prayerTimes";

export type PrayerTimings = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

type UsePrayerTimesOptions = {
  timeoutMs?: number;
  autoSchedule?: boolean;
  method?: any;
  madhab?: any;
};

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function toHHmm(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function toTimings(times: PrayerTimesMap): PrayerTimings {
  return {
    Fajr: toHHmm(times.fajr),
    Sunrise: toHHmm(times.sunrise),
    Dhuhr: toHHmm(times.dhuhr),
    Asr: toHHmm(times.asr),
    Maghrib: toHHmm(times.maghrib),
    Isha: toHHmm(times.isha),
  };
}

function formatCountdown(diffMs: number): string {
  const total = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

type NextPrayer = { key: keyof PrayerTimings; time: Date } | null;

function computeNextPrayer(
  times: PrayerTimesMap | null,
  now: Date,
): NextPrayer {
  if (!times) return null;

  const prayerOrder: Array<keyof PrayerTimings> = [
    "Fajr",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha",
  ];
  const map: Record<keyof PrayerTimings, Date> = {
    Fajr: times.fajr,
    Sunrise: times.sunrise,
    Dhuhr: times.dhuhr,
    Asr: times.asr,
    Maghrib: times.maghrib,
    Isha: times.isha,
  };

  for (const key of prayerOrder) {
    if (map[key].getTime() > now.getTime()) {
      return { key, time: map[key] };
    }
  }

  const tomorrowFajr = new Date(map.Fajr);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  return { key: "Fajr", time: tomorrowFajr };
}

export function usePrayerTimes(opts: UsePrayerTimesOptions = {}) {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [times, setTimes] = useState<PrayerTimesMap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const loadPromise = (async () => {
        const deviceCoords = await getDeviceCoordinates();
        const computed = calculatePrayerTimes(
          deviceCoords,
          new Date(),
          opts.method,
          opts.madhab,
        );
        setCoords(deviceCoords);
        setTimes(computed);
      })();

      if (opts.timeoutMs && opts.timeoutMs > 0) {
        await Promise.race([
          loadPromise,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Timed out while fetching prayer times")),
              opts.timeoutMs,
            ),
          ),
        ]);
      } else {
        await loadPromise;
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load prayer times");
    } finally {
      setLoading(false);
    }
  }, [opts.madhab, opts.method, opts.timeoutMs]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timings = useMemo(() => (times ? toTimings(times) : null), [times]);
  const nextPrayer = useMemo(() => computeNextPrayer(times, now), [times, now]);
  const countdown = useMemo(() => {
    if (!nextPrayer) return null;
    return formatCountdown(nextPrayer.time.getTime() - now.getTime());
  }, [nextPrayer, now]);

  return {
    coords,
    times,
    timings,
    loading,
    error,
    refresh,
    nextPrayer: nextPrayer
      ? { key: nextPrayer.key, time: toHHmm(nextPrayer.time) }
      : null,
    nextKey: nextPrayer?.key ?? null,
    countdown,
    cancelAllNotifications: cancelAllPrayerNotifications,
    cancelNotificationForPrayer: cancelScheduledByTag,
  };
}

export default usePrayerTimes;
