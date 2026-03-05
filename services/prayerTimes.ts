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

/**
 * Fetch prayer times using only latitude, longitude and optional timezone.
 * Uses api.aladhan.com and requests timings for "today" using the timezone string if provided.
 *
 * @param params.latitude
 * @param params.longitude
 * @param params.timezone optional IANA timezone string (e.g. "Europe/Cairo"). If not provided, API will infer.
 * @param params.timeoutMs optional fetch timeout in ms (default 5000)
 */
export async function fetchPrayerTimesByCoords(params: {
  latitude: number;
  longitude: number;
  timezone?: string;
  timeoutMs?: number;
}): Promise<PrayerTimings> {
  const { latitude, longitude, timezone, timeoutMs = 5000 } = params;

  // Use today's timestamp to avoid server returning unexpected day
  const timestamp = Math.floor(Date.now() / 1000);

  let url =
    `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}` +
    `&longitude=${longitude}`;

  if (timezone) {
    url += `&timezonestring=${encodeURIComponent(timezone)}`;
  }

  // Setup abort controller for timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Failed to fetch prayer times: ${res.status}`);
    const json = await res.json();
    const t = json?.data?.timings;
    if (!t) throw new Error("Invalid response from prayer times service");

    return {
      Fajr: cleanTime(t.Fajr),
      Sunrise: cleanTime(t.Sunrise),
      Dhuhr: cleanTime(t.Dhuhr),
      Asr: cleanTime(t.Asr),
      Maghrib: cleanTime(t.Maghrib),
      Isha: cleanTime(t.Isha),
    };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("Prayer times request timed out");
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}