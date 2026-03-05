import { ADKAR_DATA, MENU_ITEMS } from "@/data/adkar";
import { NormalizedContentItem } from "@/types";
import { normalizeAdkarItem } from "@/utils/normalizeContent";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import MenuCard from "../components/MenuCard";
import TopBar from "../components/TopBar";
import styles from "./styles/adkar.styles";

export default function AdkarScreen() {
  const [activeKey, setActiveKey] = useState<string | null>(null); // null = show menu
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadingFav, setLoadingFav] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);

  const favoritesKeyFor = useCallback((key: string) => `adkar_${key}_favorites_v1`, []);

  // load favorites when activeKey changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!activeKey) {
        setFavorites([]);
        setLoadingFav(false);
        return;
      }
      setLoadingFav(true);
      try {
        const raw = await AsyncStorage.getItem(favoritesKeyFor(activeKey));
        if (!mounted) return;
        if (raw) {
          const parsed = JSON.parse(raw) as string[];
          setFavorites(Array.isArray(parsed) ? parsed : []);
        } else {
          setFavorites([]);
        }
      } catch (e) {
        console.warn("Failed to load favorites", e);
        setFavorites([]);
      } finally {
        if (mounted) setLoadingFav(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activeKey, favoritesKeyFor]);

  const saveFavorites = async (key: string, list: string[]) => {
    try {
      await AsyncStorage.setItem(favoritesKeyFor(key), JSON.stringify(list));
    } catch (e) {
      console.warn("Failed to save favorites", e);
      Alert.alert("خطأ", "تعذّر حفظ المفضلات.");
    }
  };

  const toggleFavorite = (id: string) => {
    if (!activeKey) return;
    const isFav = favorites.includes(id);
    const next = isFav ? favorites.filter((i) => i !== id) : [...favorites, id];
    setFavorites(next);
    saveFavorites(activeKey, next);
  };

  const onCopy = async (id: string, text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (e) {
      Alert.alert("خطأ", "فشل نسخ النص.");
    }
  };

  const onShare = async (item: NormalizedContentItem) => {
    try {
      setSharingId(item.id);
      await Share.share({
        message: `${item.text}${item.repetitions ? `\n\n(التكرار: ${item.repetitions})` : ""}${item.note ? `\n\n${item.note}` : ""}`,
      });
    } catch (e) {
      console.warn("share error", e);
    } finally {
      setSharingId(null);
    }
  };

  // render the list cards for a category
  const renderCategory = (key: string) => {
    const list = (ADKAR_DATA[key] ?? []).map((item) => normalizeAdkarItem(item, key));
    if (list.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>لا توجد عناصر مضافة بعد لهذه الفئة.</Text>
        </View>
      );
    }

    return (
      <>
        {loadingFav ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        ) : null}

        {list.map((a) => {
          const isFav = favorites.includes(a.id);
          return (
            <View key={a.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{a.title ?? `بند ${a.id}`}</Text>
                {a.repetitions ? (
                  <View style={styles.repeatPill}>
                    <Text style={styles.repeatText}>▫️ {a.repetitions} مرة</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.arabicText}>{a.text}</Text>

              {a.note ? <Text style={styles.note}>🔹 {a.note}</Text> : null}

              <View style={styles.actionsRow}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => onCopy(a.id, `${a.text}\n\n${a.repetitions ? `التكرار: ${a.repetitions}` : ""}${a.note ? `\n${a.note}` : ""}`)}
                  accessibilityLabel={`نسخ بند ${a.sourceId ?? a.id}`}
                >
                  {copiedId === a.id ? (
                    <>
                      <Ionicons name="checkmark-done" size={18} color="#065F46" />
                      <Text style={styles.actionLabel}>تم النسخ</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="copy-outline" size={18} color="#065F46" />
                      <Text style={styles.actionLabel}>نسخ</Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  style={styles.actionButton}
                  onPress={() => onShare(a)}
                  accessibilityLabel={`مشاركة بند ${a.sourceId ?? a.id}`}
                >
                  {sharingId === a.id ? (
                    <ActivityIndicator size="small" color="#065F46" />
                  ) : (
                    <>
                      <Ionicons name="share-social-outline" size={18} color="#065F46" />
                      <Text style={styles.actionLabel}>مشاركة</Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  style={styles.actionButton}
                  onPress={() => toggleFavorite(a.id)}
                  accessibilityLabel={`حفظ بند ${a.sourceId ?? a.id}`}
                >
                  <Ionicons name={isFav ? "bookmark" : "bookmark-outline"} size={18} color={isFav ? "#F59E0B" : "#6B7280"} />
                  <Text style={[styles.actionLabel, isFav ? styles.favoritedLabel : undefined]}>
                    {isFav ? "محفوظ" : "حفظ"}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          {activeKey ? (
            <Pressable onPress={() => setActiveKey(null)} style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color="#065F46" />
              <Text style={styles.backText}>القائمة</Text>
            </Pressable>
          ) : null}

          <Text style={styles.screenTitle}>{activeKey ? MENU_ITEMS.find(m => m.key === activeKey)?.title ?? "الأذكار" : "الأذكار"}</Text>
          <Ionicons name="leaf-outline" size={22} color="#065F46" />
        </View>

        {/* Menu view */}
        {activeKey === null ? (
          <>
            <Text style={styles.sectionTitle}>الأقسام</Text>

            {MENU_ITEMS.map((m) => (
              <MenuCard
                key={m.key}
                title={m.title}
                subtitle={m.subtitle}
                icon={m.icon as any}
                badgeBg={m.badgeBg}
                onPress={() => setActiveKey(m.key)}
              />
            ))}

            <View style={{ height: 32 }} />
          </>
        ) : (
          <>
            {/* Category content */}
            {renderCategory(activeKey)}
            <View style={{ height: 32 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}