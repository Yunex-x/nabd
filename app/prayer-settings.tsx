import React, { useEffect, useState } from "react";
import { View, Text, Switch, StyleSheet, TextInput, Button, Alert } from "react-native";
import TopBar from "@/components/TopBar";
import {getNotificationSettings,PrayerNotificationSettings,saveNotificationSettings,schedulePrayerNotifications,} from "@/services/prayerNotifications";
import { usePrayerTimes } from "../hooks/usePrayerTimes";

export default function PrayerSettingsScreen() {
  const { timings, loading: timingsLoading } = usePrayerTimes({ timeoutMs: 4000 });
  const [settings, setSettings] = useState<PrayerNotificationSettings | null>(null);

  useEffect(() => {
    let mounted = true;
    const initSettings = async () => {
      try {
        const s = await getNotificationSettings();
        if (!mounted) return;
        setSettings(s);
      } catch (e) {
        console.error("Failed to load notification settings:", e);
      }
    };
    initSettings();
    return () => { mounted = false; };
  }, []);

  const togglePrayer = (key: keyof PrayerNotificationSettings["enabled"]) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, enabled: { ...prev.enabled, [key]: !prev.enabled[key] } };
    });
  };

  const setPreNotify = (val: string) => {
    const n = Number(val || "0");
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, preNotifyMinutes: Math.max(0, Math.floor(n)) };
    });
  };

  const onSave = async () => {
    try {
      if (!settings) return;
      await saveNotificationSettings(settings);
      if (timings) {
        await schedulePrayerNotifications(timings, settings);
        Alert.alert("تم", "تم حفظ الإعدادات وجدولة الإشعارات.");
      } else {
        Alert.alert("ملاحظة", "تم حفظ الإعدادات، سيتم جدولة الإشعارات عند توافر مواقيت الصلاة.");
      }
    } catch (e: any) {
      Alert.alert("خطأ", e?.message ?? "فشل الحفظ");
    }
  };

  if (!settings) return null;

  return (
    <View style={styles.container}>
      <TopBar />
      <View style={styles.content}>
        <Text style={styles.title}>إعدادات إشعارات الصلاة</Text>

        <View style={styles.row}>
          <Text style={styles.label}>إشعارات الفجر</Text>
          <Switch value={settings.enabled.Fajr} onValueChange={() => togglePrayer("Fajr")} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>إشعارات الظهر</Text>
          <Switch value={settings.enabled.Dhuhr} onValueChange={() => togglePrayer("Dhuhr")} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>إشعارات العصر</Text>
          <Switch value={settings.enabled.Asr} onValueChange={() => togglePrayer("Asr")} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>إشعارات المغرب</Text>
          <Switch value={settings.enabled.Maghrib} onValueChange={() => togglePrayer("Maghrib")} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>إشعارات العشاء</Text>
          <Switch value={settings.enabled.Isha} onValueChange={() => togglePrayer("Isha")} />
        </View>

        <View style={[styles.row, { alignItems: "center" }]}>
          <Text style={styles.label}>إشعار قبل الصلاة (دقائق)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(settings.preNotifyMinutes)}
            onChangeText={setPreNotify}
          />
        </View>

        <Button title="حفظ وجدولة" onPress={onSave} />
        <Text style={styles.note}>{timingsLoading ? "جاري الحصول على مواقيت اليوم..." : (timings ? "مواقيت جاهزة للجدولة." : "المواقيت غير متاحة حالياً.")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: "700", textAlign: "right" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  label: { fontSize: 16 },
  input: { width: 72, borderWidth: 1, borderColor: "#E5E7EB", padding: 8, textAlign: "center", borderRadius: 8 },
  note: { marginTop: 8, color: "#6B7280" },
});