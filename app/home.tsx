import type { Verse } from "@/data/verses";
import { VERSES, VERSE_INDEX_KEY } from "@/data/verses";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BottomBar from "../components/BottomBar";
import TopBar from "../components/TopBar";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import MenuCard from "./MenuCard";
import PrayerTimesCard from "./PrayerTimesCard";
import styles from "./styles/home.styles";

export default function Home() {
  const router = useRouter();

  const { loading, error, timings, nextPrayer, countdown, nextKey } =
    usePrayerTimes({ timeoutMs: 4000 });

  const [verseIndex, setVerseIndex] = useState<number | null>(null);
  const [verse, setVerse] = useState<Verse | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(VERSE_INDEX_KEY);
        const last = raw ? parseInt(raw, 10) : -1;
        const next = (last + 1) % VERSES.length;
        if (!mounted) return;
        setVerseIndex(next);
        setVerse(VERSES[next]);
        await AsyncStorage.setItem(VERSE_INDEX_KEY, String(next));
      } catch (e) {
        const idx = Math.floor(Math.random() * VERSES.length);
        if (!mounted) return;
        setVerseIndex(idx);
        setVerse(VERSES[idx]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const showNextVerse = async () => {
    try {
      const next = verseIndex === null ? 0 : (verseIndex + 1) % VERSES.length;
      setVerseIndex(next);
      setVerse(VERSES[next]);
      await AsyncStorage.setItem(VERSE_INDEX_KEY, String(next));
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
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
          title="مواقيت الصلاة"
          subtitle="اطّلع على مواقيت اليوم"
          icon="time-outline"
          badgeBg="#FEF3C7"
          onPress={() => router.push("/prayer-times")}
        />

        <MenuCard
          title="إعدادات الإشعارات"
          subtitle="خصص إشعارات الصلاة"
          icon="notifications-outline"
          badgeBg="#E0F2FE"
          onPress={() => router.push("/prayer-settings")}
        />

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
          icon="heart-outline"
          badgeBg="#FEEFF2"
          onPress={() => router.push("/ad3iya")}
        />

        {/* ... rest unchanged ... */}
      </ScrollView>

      <BottomBar />
    </View>
  );
}