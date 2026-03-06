import React from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator } from "react-native";
import TopBar from "@/components/TopBar";
import { useRouter } from "expo-router";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

export default function PrayerTimesScreen() {
  const router = useRouter();
  const { loading, error, timings, nextPrayer, countdown, refresh } = usePrayerTimes({ timeoutMs: 4000 });

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.content}>
        <Text style={styles.title}>مواقيت الصلاة</Text>

        {loading && <ActivityIndicator />}

        {error && (
          <View style={styles.block}>
            <Text style={styles.error}>خطأ: {error}</Text>
          </View>
        )}

        {timings && (
          <View style={styles.times}>
            <Text>الفجر: {timings.Fajr}</Text>
            <Text>الظهر: {timings.Dhuhr}</Text>
            <Text>العصر: {timings.Asr}</Text>
            <Text>المغرب: {timings.Maghrib}</Text>
            <Text>العشاء: {timings.Isha}</Text>

            <View style={{ marginTop: 12 }}>
              <Text>الصلاة القادمة: {nextPrayer?.key ?? "-"}</Text>
              <Text>العد التنازلي: {countdown}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttons}>
          <Button title="إعدادات الإشعارات" onPress={() => router.push("/prayer-settings")} />
          <Button title="تحديث" onPress={refresh} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12, textAlign: "right" },
  times: { gap: 8 },
  buttons: { marginTop: 18, gap: 8 },
  block: { padding: 12 },
  error: { color: "#B91C1C" },
});