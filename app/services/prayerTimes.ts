export type PrayerTimings = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

function cleanTime(t: string) {
  return t.split(" ")[0].trim(); // "05:12 (+01)" -> "05:12"
}

export async function fetchPrayerTimesByCoords(params: {
  latitude: number;
  longitude: number;
  method?: number; // default 3 (MWL)
  school?: 0 | 1;  // 0 Shafi/Maliki, 1 Hanafi
  tune?: string;   // optional "0,0,0,0,0,0,0,0,0"
}): Promise<PrayerTimings> {
  const { latitude, longitude, method = 3, school = 0, tune } = params;

  const base =
    `https://api.aladhan.com/v1/timings?latitude=${latitude}` +
    `&longitude=${longitude}&method=${method}&school=${school}`;

  const url = tune ? `${base}&tune=${encodeURIComponent(tune)}` : base;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch prayer times");

  const json = await res.json();
  const t = json?.data?.timings;

  return {
    Fajr: cleanTime(t.Fajr),
    Sunrise: cleanTime(t.Sunrise),
    Dhuhr: cleanTime(t.Dhuhr),
    Asr: cleanTime(t.Asr),
    Maghrib: cleanTime(t.Maghrib),
    Isha: cleanTime(t.Isha),
  };
}