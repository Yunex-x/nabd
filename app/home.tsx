import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import styles from "./styles/home.styles";
import PrayerTimesCard from "./PrayerTimesCard";
import MenuCard from "./MenuCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Verse } from "./data/verses";
import { VERSES, VERSE_INDEX_KEY } from "./data/verses";

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
        <Text style={styles.sectionTitle}>آيات اليوم</Text>

        {verse ? (
          <View style={[styles.card, localStyles.verseCard]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.date}>السورة: {verse.surah} — الآية: {verse.ayah}</Text>
            </View>

            <Text style={[styles.bigText, localStyles.verseText]}>{verse.text}</Text>

            <Text style={[styles.infoText, localStyles.tafsirLabel]}>الشرح</Text>
            <Text style={[styles.infoText, localStyles.tafsirText]}>{verse.tafsir}</Text>

            <View style={localStyles.controlsRow}>
              <Pressable onPress={showNextVerse} style={localStyles.nextButton}>
                <Text style={localStyles.nextButtonText}>التالي</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* BottomBar: structure [ القبلة ]  (app logo placeholder)  [ أقرب مسجد ] */}
      <BottomBar
        onQiblaPress={() => {
          // navigate to your qibla screen - change route as needed
          router.push("/qibla");
        }}
        onNearestMosquePress={() => {
          // navigate to nearest mosque / map screen - change route as needed
          router.push("/mosqwues");
        }}
        // optional: pass a logo image:
        // logo={require("../assets/logo.png")}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  verseCard: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  verseText: {
    textAlign: "right",
    writingDirection: "rtl",
    marginTop: 8,
    color: "#0F172A",
    fontSize: 20,
    lineHeight: 30,
    fontWeight: "800",
  },
  tafsirLabel: {
    marginTop: 10,
    textAlign: "right",
    fontWeight: "700",
    color: "#065F46",
  },
  tafsirText: {
    marginTop: 6,
    textAlign: "right",
    color: "#374151",
    lineHeight: 20,
  },
  controlsRow: {
    marginTop: 12,
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
  },
  nextButton: {
    backgroundColor: "#065F46",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
});