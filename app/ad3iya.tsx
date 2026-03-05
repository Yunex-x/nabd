import { MENU_ITEMS, PRAYERS_GROUPS } from "@/data/ad3iya";
import { NormalizedContentItem } from "@/types";
import { normalizeAd3iyaItem } from "@/utils/normalizeContent";
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
import styles from "./styles/ad3iya.styles";
export default function Ad3iyaScreen() {
  const [activeKey, setActiveKey] = useState<string | null>(null); // null = show menu
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadingFav, setLoadingFav] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);

  const favoritesKeyFor = useCallback((key: string) => `ad3iya_${key}_favorites_v1`, []);

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

  const onShare = async (p: NormalizedContentItem) => {
    try {
      setSharingId(p.id);
      await Share.share({
        message: `${p.title ?? ""}\n\n${p.text}${p.reference ? `\n\n${p.reference}` : ""}`,
      });
    } catch (e) {
      console.warn("Share error", e);
    } finally {
      setSharingId(null);
    }
  };

  const renderListForKey = (key: string) => {
    const list = (PRAYERS_GROUPS[key] ?? []).map((item) => normalizeAd3iyaItem(item, key));
    if (list.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>لا توجد أدعية مضافة بعد لهذه الفئة.</Text>
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

        {list.map((p) => {
          const isFav = favorites.includes(p.id);
          return (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{p.title}</Text>
              </View>

              <Text style={styles.arabicText}>{p.text}</Text>

              {p.reference ? (
                <View style={styles.metaRow}>
                  <Ionicons name="book-outline" size={14} color="#6B7280" />
                  <Text style={styles.reference}>{p.reference}</Text>
                </View>
              ) : null}

              {p.note ? <Text style={styles.note}>🔹 {p.note}</Text> : null}

              <View style={styles.actionsRow}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => onCopy(p.id, `${p.title ?? ""}\n\n${p.text}${p.reference ? `\n\n${p.reference}` : ""}`)}
                  accessibilityLabel={`نسخ ${p.title}`}
                >
                  {copiedId === p.id ? (
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
                  onPress={() => onShare(p)}
                  accessibilityLabel={`مشاركة ${p.title}`}
                >
                  {sharingId === p.id ? (
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
                  onPress={() => toggleFavorite(p.id)}
                  accessibilityLabel={`حفظ ${p.title}`}
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
            <Pressable onPress={() => setActiveKey(null)} style={{ flexDirection: "row", alignItems: "center", padding: 4, borderRadius: 8, backgroundColor: "#E0F2FE", marginLeft: 8 }}>
              <Text style={[styles.screenTitle, { textAlign: "left", marginRight: 8, fontSize: 16, color: "#065F46" }]}>القائمة</Text>
              <Ionicons name="chevron-back" size={20} color="#065F46" />
            </Pressable>
          ) : null}

          <Text style={styles.screenTitle}>{activeKey ? MENU_ITEMS.find(m => m.key === activeKey)?.title ?? "الأدعية" : "الأدعية"}</Text>
          <Ionicons name="layers-sharp" size={22} color="#065F46" />
        </View>

        {/* Menu view */}
        {activeKey === null ? (
          <>
            <Text style={styles.screenTitle}>الأقسام</Text>

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
            {renderListForKey(activeKey)}
            <View style={{ height: 32 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}