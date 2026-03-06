// services/notifications.ts
// Request permission, schedule/cancel notifications, store ids in AsyncStorage.

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'SCHEDULED_PRAYER_NOTIFICATION_IDS';

export async function requestNotificationsPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyNotificationForPrayer(
  idTag: string, // unique tag per prayer, e.g. 'prayer_fajr'
  hour: number,
  minute: number,
  title: string,
  body?: string
): Promise<string> {
  // Use daily trigger (hour/minute) with repeats
  const trigger = { hour, minute, repeats: true } as any;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: body ?? '',
      // Optionally include data and custom sound; for custom sound on iOS add in native config
      data: { tag: idTag },
    },
    trigger,
  });

  await storeScheduledId(idTag, notificationId);
  return notificationId;
}

export async function cancelScheduledById(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // ignore
  }
}

export async function cancelScheduledByTag(idTag: string) {
  const map = await getScheduledMap();
  const id = map[idTag];
  if (id) {
    await cancelScheduledById(id);
    delete map[idTag];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }
}

export async function cancelAllPrayerNotifications() {
  const map = await getScheduledMap();
  for (const id of Object.values(map)) {
    await cancelScheduledById(id as string);
  }
  await AsyncStorage.removeItem(STORAGE_KEY);
}

async function storeScheduledId(idTag: string, notificationId: string) {
  const map = await getScheduledMap();
  map[idTag] = notificationId;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

async function getScheduledMap(): Promise<Record<string, string>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}