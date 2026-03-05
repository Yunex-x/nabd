import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveJSON<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadJSON<T>(key: string, fallback: T | null = null): Promise<T | null> {
  const v = await AsyncStorage.getItem(key);
  if (!v) return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

export async function removeKey(key: string) {
  await AsyncStorage.removeItem(key);
}