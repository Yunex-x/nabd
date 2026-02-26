import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles/home.styles";

type PrayerTimings = Record<string, string> | null;
type NextPrayer = { key: string; time?: string } | null;

export default function PrayerTimesCard({
    loading,
    error,
    timings,
    nextPrayer,
    countdown,
    nextKey,
}: {
    loading: boolean;
    error: string | null;
    timings: PrayerTimings;
    nextPrayer: NextPrayer;
    countdown: string | null;
    nextKey: string | null;
}) {
    const arName: Record<string, string> = {
        Fajr: "الفجر",
        Sunrise: "الشروق",
        Dhuhr: "الظهر",
        Asr: "العصر",
        Maghrib: "المغرب",
        Isha: "العشاء",
    };

    const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
                <Text style={styles.date}>اليوم</Text>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            </View>

            <Text style={styles.bigText}>تقبل الله طاعتكم</Text>

            {loading && <Text style={styles.infoText}>جاري تحميل المواقيت…</Text>}

            {error && <Text style={styles.errorText}>{error} — فعّل GPS وجرّب</Text>}

            {timings && (
                <>
                    <Text style={styles.nextPrayerText}>
                        الصلاة القادمة: {arName[nextPrayer?.key ?? ""]} بعد {countdown}
                    </Text>

                    <View style={styles.timesRow}>
                        {order.map((key) => {
                            const isActive = key === nextKey;
                            return (
                                <View
                                    key={key}
                                    style={[styles.timePill, isActive && styles.activePill]}
                                >
                                    <Text style={isActive ? styles.timeTextActive : styles.timeText}>
                                        {timings[key]}
                                    </Text>
                                    <Text style={isActive ? styles.timeLabelActive : styles.timeLabel}>
                                        {arName[key]}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </>
            )}
        </View>
    );
}