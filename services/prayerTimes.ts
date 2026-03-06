// services/prayerTimes.ts
// Computes prayer times using 'adhan' and handles location lookup.

import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";
import * as Location from "expo-location";

export type PrayerTimesMap = {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
};

export async function getDeviceCoordinates(): Promise<Coordinates> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission not granted");
  }

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
}

/**
 * Calculate prayer times for a given date & coordinates.
 * Uses adhan library CalculationMethod.MuslimWorldLeague by default.
 * You can switch to CalculationMethod.UmmAlQura, CalculationMethod.Makkah, etc.
 */
export function calculatePrayerTimes(
  coords: Coordinates,
  date: Date = new Date(),
  method = CalculationMethod.MuslimWorldLeague(),
  madhab = Madhab.Shafi,
): PrayerTimesMap {
  const params = method;
  params.madhab = madhab;
  // Optional adjustments can be applied here: params.adjustments = {...}

  const times = new PrayerTimes(coords, date, params);

  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  };
}
