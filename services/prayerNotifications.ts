import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  cancelAllPrayerNotifications,
  requestNotificationsPermission,
  scheduleDailyNotificationForPrayer,
} from "./notifications";

export type PrayerKey = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export type PrayerNotificationSettings = {
  enabled: Record<PrayerKey, boolean>;
  preNotifyMinutes: number;
};

const SETTINGS_KEY = "PRAYER_NOTIFICATION_SETTINGS_V1";

const DEFAULT_SETTINGS: PrayerNotificationSettings = {
  enabled: {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
  preNotifyMinutes: 0,
};

type PrayerTimingsInput = Partial<
  Record<PrayerKey, string | Date | null | undefined>
>;

const PRAYER_LABELS_AR: Record<PrayerKey, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

function clampMinutes(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function parseTimingToHourMinute(
  value: string | Date,
): { hour: number; minute: number } | null {
  if (value instanceof Date) {
    return { hour: value.getHours(), minute: value.getMinutes() };
  }

  const cleaned = value.trim();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return { hour, minute };
}

function shiftTime(
  hour: number,
  minute: number,
  minusMinutes: number,
): { hour: number; minute: number } {
  const total =
    (((hour * 60 + minute - minusMinutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

export async function getNotificationSettings(): Promise<PrayerNotificationSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;

  try {
    const parsed = JSON.parse(raw) as Partial<PrayerNotificationSettings>;
    return {
      enabled: {
        Fajr: parsed.enabled?.Fajr ?? DEFAULT_SETTINGS.enabled.Fajr,
        Dhuhr: parsed.enabled?.Dhuhr ?? DEFAULT_SETTINGS.enabled.Dhuhr,
        Asr: parsed.enabled?.Asr ?? DEFAULT_SETTINGS.enabled.Asr,
        Maghrib: parsed.enabled?.Maghrib ?? DEFAULT_SETTINGS.enabled.Maghrib,
        Isha: parsed.enabled?.Isha ?? DEFAULT_SETTINGS.enabled.Isha,
      },
      preNotifyMinutes: clampMinutes(
        parsed.preNotifyMinutes ?? DEFAULT_SETTINGS.preNotifyMinutes,
      ),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveNotificationSettings(
  settings: PrayerNotificationSettings,
): Promise<void> {
  const sanitized: PrayerNotificationSettings = {
    enabled: {
      Fajr: !!settings.enabled.Fajr,
      Dhuhr: !!settings.enabled.Dhuhr,
      Asr: !!settings.enabled.Asr,
      Maghrib: !!settings.enabled.Maghrib,
      Isha: !!settings.enabled.Isha,
    },
    preNotifyMinutes: clampMinutes(settings.preNotifyMinutes),
  };

  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitized));
}

export async function schedulePrayerNotifications(
  timings: PrayerTimingsInput,
  settings: PrayerNotificationSettings,
): Promise<void> {
  const granted = await requestNotificationsPermission();
  if (!granted) {
    throw new Error("لم يتم منح إذن الإشعارات");
  }

  await cancelAllPrayerNotifications();

  const keys: PrayerKey[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  for (const key of keys) {
    if (!settings.enabled[key]) continue;
    const raw = timings[key];
    if (!raw) continue;

    const parsed = parseTimingToHourMinute(raw);
    if (!parsed) continue;

    const triggerTime = shiftTime(
      parsed.hour,
      parsed.minute,
      clampMinutes(settings.preNotifyMinutes),
    );

    await scheduleDailyNotificationForPrayer(
      `prayer_${key.toLowerCase()}`,
      triggerTime.hour,
      triggerTime.minute,
      `حان وقت صلاة ${PRAYER_LABELS_AR[key]}`,
      settings.preNotifyMinutes > 0
        ? `تبقّى ${settings.preNotifyMinutes} دقيقة على الصلاة`
        : "حان الآن وقت الصلاة",
    );
  }
}
