import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Share,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import TopBar from "../components/TopBar";
import MenuCard from "../components/MenuCard";
import styles from "./styles/adkar.styles";

type AdkarItem = {
  id: number;
  title?: string;
  arabic: string;
  repeat?: number;
  note?: string;
};

const MENU_ITEMS = [
  { key: "saba7", title: "أذكار الصباح", subtitle: "أذكار لبداية اليوم", icon: "sunny-outline", badgeBg: "#FEF3C7" },
  { key: "masae", title: "أذكار المساء", subtitle: "أذكار قبل المساء", icon: "moon-outline", badgeBg: "#EDE9FE" },
  { key: "nawm", title: "أذكار النوم", subtitle: "أذكار قبل النوم", icon: "bed-outline", badgeBg: "#E0F2FE" },
  { key: "masjid", title: "أذكار المسجد", subtitle: "أذكار الدخول/الخروج", icon: "business-outline", badgeBg: "#DBEAFE" },
  { key: "isti9ad", title: "أذكار الاستيقاظ", subtitle: "أذكار بعد الاستيقاظ", icon: "alarm-outline", badgeBg: "#DCFCE7" },
  { key: "assalat", title: "أذكار الصلاة", subtitle: "أذكار مرتبطة بالصلوات", icon: "walk-outline", badgeBg: "#FFEDD5" },
];

// Morning adhkar (saba7)
const ADKAR_SABA7: AdkarItem[] = [
  { id: 1, arabic: "﴿اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ... وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾", repeat: 1 },
  { id: 2, arabic: "﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾", repeat: 3 },
  { id: 3, arabic: "﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا ��َلَقَ ... وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾", repeat: 3 },
  { id: 4, arabic: "﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ... مِنَ الْجِنَّةِ وَالنَّاسِ﴾", repeat: 3 },
  { id: 5, arabic: "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، ربِّ أسألك خير ما في هذا اليوم وخير ما بعده، وأعوذ بك من شر ما في هذا اليوم وشر ما بعده، ربِّ أعوذ بك من الكسل وسوء الكِبَر، ربِّ أعوذ بك من عذاب في النار وعذاب في القبر.", repeat: 1 },
  { id: 6, arabic: "اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور.", repeat: 1 },
  { id: 7, arabic: "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك عليّ وأبوء بذنبي فاغفر لي، فإنه لا يغفر الذنوب إلا أنت.", repeat: 1 },
  { id: 8, arabic: "رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد ﷺ نبيًا.", repeat: 3 },
  { id: 9, arabic: "اللهم إني أصبحت أُشهدك وأُشهد حملة عرشك وملائكتك وجميع خلقك أنك أنت الله لا إله إلا أنت وحدك لا شريك لك وأن محمدًا عبدك ورسولك.", repeat: 4 },
  { id: 10, arabic: "يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله، ولا تكلني إلى نفسي طرفة عين.", repeat: 1 },
  { id: 11, arabic: "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.", repeat: 7 },
  { id: 12, arabic: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.", repeat: 3 },
  { id: 13, arabic: "اللهم ما أصبح بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر.", repeat: 1 },
  { id: 14, arabic: "اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت، اللهم إني أعوذ بك من الكفر والفقر، وأعوذ بك من عذاب القبر، لا إله إلا أنت.", repeat: 3 },
  { id: 15, arabic: "اللهم إني أسألك العفو والعافية في الدنيا والآخرة، اللهم إني أسألك العفو والعافية في ديني ودنياي وأهلي ومالي، اللهم استر عوراتي وآمن روعاتي، اللهم احفظني من بين يدي ومن خلفي وعن يميني وعن شمالي ومن فوقي، وأعوذ بعظمتك أن أُغتال من تحتي.", repeat: 1 },
  { id: 16, arabic: "سبحان الله وبحمده.", repeat: 100 },
  { id: 17, arabic: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.", repeat: 100 },
  { id: 18, arabic: "أستغفر الله وأتوب إليه.", repeat: 100 },
];

// Evening adhkar (masae) — using the text you provided
const ADKAR_MASAE: AdkarItem[] = [
  { id: 1, arabic: "﴿اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ... وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾", repeat: 1 },
  { id: 2, arabic: "﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾", repeat: 3 },
  { id: 3, arabic: "﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ... وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾", repeat: 3 },
  { id: 4, arabic: "﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ... مِنَ الْجِنَّةِ وَالنَّاسِ﴾", repeat: 3 },
  { id: 5, arabic: "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، ربِّ أسألك خير ما في هذه الليلة وخير ما بعدها، وأعوذ بك من شر ما في هذه الليلة وشر ما بعدها، ربِّ أعوذ بك من الكسل وسوء الكِبَر، ربِّ أعوذ بك من عذاب في النار وعذاب في القبر.", repeat: 1 },
  { id: 6, arabic: "اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير.", repeat: 1 },
  { id: 7, arabic: "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك عليّ وأبوء بذنبي فاغفر لي، فإنه لا يغفر الذنوب إلا أنت.", repeat: 1 },
  { id: 8, arabic: "رضيت بالله ربًا، وبالإسلام دينًا، وبمح��د ﷺ نبيًا.", repeat: 3 },
  { id: 9, arabic: "اللهم إني أمسيت أُشهدك وأُشهد حملة عرشك وملائكتك وجميع خلقك أنك أنت الله لا إله إلا أنت وحدك لا شريك لك وأن محمدًا عبدك ورسولك.", repeat: 4 },
  { id: 10, arabic: "يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله، ولا تكلني إلى نفسي طرفة عين.", repeat: 1 },
  { id: 11, arabic: "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.", repeat: 7 },
  { id: 12, arabic: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.", repeat: 3 },
  { id: 13, arabic: "اللهم ما أمسى بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر.", repeat: 1 },
  { id: 14, arabic: "اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت، اللهم إني أعوذ بك من الكفر والفقر، وأعوذ بك من عذاب القبر، لا إله إلا أنت.", repeat: 3 },
  { id: 15, arabic: "اللهم إني أسألك العفو والعافية في الدنيا والآخرة، اللهم إني أسألك العفو والعافية في ديني ودنياي وأهلي ومالي، اللهم استر عوراتي وآمن روعاتي، اللهم احفظني من بين يدي ومن خلفي وعن يميني وعن شمالي ومن فو��ي، وأعوذ بعظمتك أن أُغتال من تحتي.", repeat: 1 },
  { id: 16, arabic: "سبحان الله وبحمده.", repeat: 100 },
  { id: 17, arabic: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.", repeat: 100 },
  { id: 18, arabic: "أستغفر الله وأتوب إليه.", repeat: 100 },
];

const ADKAR_DATA: Record<string, AdkarItem[]> = {
  saba7: ADKAR_SABA7,
  masae: ADKAR_MASAE,
  nawm: [],
  masjid: [],
  isti9ad: [],
  assalat: [],
};

export default function AdkarScreen() {
  const [activeKey, setActiveKey] = useState<string | null>(null); // null = show menu
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loadingFav, setLoadingFav] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [sharingId, setSharingId] = useState<number | null>(null);

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
          const parsed = JSON.parse(raw) as number[];
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

  const saveFavorites = async (key: string, list: number[]) => {
    try {
      await AsyncStorage.setItem(favoritesKeyFor(key), JSON.stringify(list));
    } catch (e) {
      console.warn("Failed to save favorites", e);
      Alert.alert("خطأ", "تعذّر حفظ المفضلات.");
    }
  };

  const toggleFavorite = (id: number) => {
    if (!activeKey) return;
    const isFav = favorites.includes(id);
    const next = isFav ? favorites.filter((i) => i !== id) : [...favorites, id];
    setFavorites(next);
    saveFavorites(activeKey, next);
  };

  const onCopy = async (id: number, text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (e) {
      Alert.alert("خطأ", "فشل نسخ النص.");
    }
  };

  const onShare = async (item: AdkarItem) => {
    try {
      setSharingId(item.id);
      await Share.share({
        message: `${item.arabic}${item.repeat ? `\n\n(التكرار: ${item.repeat})` : ""}`,
      });
    } catch (e) {
      console.warn("share error", e);
    } finally {
      setSharingId(null);
    }
  };

  // render the list cards for a category
  const renderCategory = (key: string) => {
    const list = ADKAR_DATA[key] ?? [];
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
                {a.repeat ? (
                  <View style={styles.repeatPill}>
                    <Text style={styles.repeatText}>▫️ {a.repeat} مرة</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.arabicText}>{a.arabic}</Text>

              {a.note ? <Text style={styles.note}>🔹 {a.note}</Text> : null}

              <View style={styles.actionsRow}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => onCopy(a.id, `${a.arabic}\n\n${a.repeat ? `التكرار: ${a.repeat}` : ""}`)}
                  accessibilityLabel={`نسخ بند ${a.id}`}
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
                  accessibilityLabel={`مشاركة بند ${a.id}`}
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
                  accessibilityLabel={`حفظ بند ${a.id}`}
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