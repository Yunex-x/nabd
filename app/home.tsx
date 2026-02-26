import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import TopBar from "../components/TopBar";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import styles from "./styles/home.styles";
import PrayerTimesCard from "./PrayerTimesCard";
import MenuCard from "./MenuCard";

export default function Home() {
  const router = useRouter();

  // Morocco-friendly defaults:
  // method 3 (MWL), school 0 (Shafi/Maliki)
  const { loading, error, timings, nextPrayer, countdown, nextKey } =
    usePrayerTimes({ method: 3, school: 0 });

  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PrayerTimesCard
          loading={loading}
          error={error}
          timings={timings}
          nextPrayer={nextPrayer}
          countdown={countdown}
          nextKey={nextKey}
        />

        <Text style={styles.sectionTitle}>الأقسام الرئيسية</Text>

        <MenuCard
          title="أذكار"
          subtitle="الصباح و المساء"
          icon="book-outline"
          badgeBg="#DBEAFE"
          onPress={() => router.push("/adkar")}
        />

        <MenuCard
          title="أوراد"
          subtitle="وردك اليومي"
          icon="library-outline"
          badgeBg="#EDE9FE"
          onPress={() => router.push("/awrad")}
        />

        <MenuCard
          title="تسبيح"
          subtitle="مسبحة إلكترونية"
          icon="finger-print-outline"
          badgeBg="#DCFCE7"
          onPress={() => router.push("/tasbi7")}
        />

        <MenuCard
          title="أدعية"
          subtitle="جوامع الدعاء"
          icon="add-outline"
          badgeBg="#FFEDD5"
          onPress={() => router.push("/ad3iya")}
        />
      </ScrollView>
    </View>
  );
}