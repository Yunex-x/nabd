import React, { useEffect, useState } from "react";
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
import styles from "./styles/ad3iya.styles";

type Prayer = {
    id: number;
    title: string;
    arabic: string;
    reference: string;
    note?: string;
};

const PRAYERS: Prayer[] = [
    {
        id: 1,
        title: "دعاء آدم عليه السلام",
        arabic:
            "﴿رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ﴾",
        reference: "سورة الأعراف، الآية 23",
        note: "دعاء توبة واعتراف بالذنب.",
    },
    {
        id: 2,
        title: "دعاء نوح عليه السلام",
        arabic:
            "﴿رَبِّ إِنِّي أَعُوذُ بِكَ أَنْ أَسْأَلَكَ مَا لَيْسَ لِي بِهِ عِلْمٌ وَإِلَّا تَغْفِرْ لِي وَتَرْحَمْنِي أَكُنْ مِنَ الْخَاسِرِينَ﴾",
        reference: "سورة هود، الآية 47",
        note: "دعاء طلب المغفرة بعد الخطأ.",
    },
    {
        id: 3,
        title: "دعاء إبراهيم عليه السلام",
        arabic:
            "﴿رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ﴾",
        reference: "سورة إبراهيم، الآية 40",
        note: "دعاء بالثبات على العبادة.",
    },
    {
        id: 4,
        title: "دعاء موسى عليه السلام",
        arabic:
            "﴿رَبِّ اشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِي أَمْرِي ۝ وَاحْلُلْ عُقْدَةً مِن لِّسَانِي ۝ يَفْقَهُوا قَوْلِي﴾",
        reference: "سورة طه، الآيات 25–28",
        note: "دعاء لتيسير الأمور والكلام.",
    },
    {
        id: 5,
        title: "دعاء أيوب عليه السلام",
        arabic: "﴿أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ﴾",
        reference: "سورة الأنبياء، الآية 83",
        note: "دعاء عند المرض والابتلاء.",
    },
    {
        id: 6,
        title: "دعاء يونس عليه السلام",
        arabic:
            "﴿لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ﴾",
        reference: "سورة الأنبياء، الآية 87",
        note: "من أعظم أدعية تفريج الكرب.",
    },
    {
        id: 7,
        title: "دعاء زكريا عليه السلام",
        arabic: "﴿رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ﴾",
        reference: "سورة الأنبياء، الآية 89",
        note: "دعاء بطلب الذرية.",
    },
];

const FAVORITES_KEY = "ad3iya_favorites_v1";

const TABS = [
    { key: "prophets", label: "أدعية الأنبياء" },
    // You can add more tabs here later if needed
];

export default function Ad3iyaScreen() {
    const [favorites, setFavorites] = useState<number[]>([]);
    const [loadingFav, setLoadingFav] = useState(true);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [sharingId, setSharingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<string | null>(null); // null = no tab selected

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(FAVORITES_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw) as number[];
                    setFavorites(Array.isArray(parsed) ? parsed : []);
                }
            } catch (e) {
                console.warn("Failed to load favorites", e);
            } finally {
                setLoadingFav(false);
            }
        })();
    }, []);

    const saveFavorites = async (list: number[]) => {
        try {
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
        } catch (e) {
            console.warn("Failed to save favorites", e);
            Alert.alert("خطأ", "تعذّر حفظ المفضلات.");
        }
    };

    const toggleFavorite = (id: number) => {
        const isFav = favorites.includes(id);
        const next = isFav ? favorites.filter((i) => i !== id) : [...favorites, id];
        setFavorites(next);
        saveFavorites(next);
    };

    const onCopy = async (id: number, text: string) => {
        try {
            await Clipboard.setStringAsync(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1800);
        } catch (e) {
            Alert.alert("خطأ", "فشل نسخ النص.");
        }
    };

    const onShare = async (p: Prayer) => {
        try {
            setSharingId(p.id);
            await Share.share({
                message: `${p.title}\n\n${p.arabic}\n\n${p.reference}`,
            });
        } catch (e) {
            // ignore share cancel/errors
            console.warn("Share error", e);
        } finally {
            setSharingId(null);
        }
    };

    return (
        <View style={styles.container}>
            <TopBar />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.screenTitle}>الأدعية</Text>
                    <Ionicons name="layers-sharp" size={22} color="#065F46" />
                </View>

                {/* Tab Bar */}
                <View style={styles.tabBar}>
                    {TABS.map((t) => {
                        const active = activeTab === t.key;
                        return (
                            <Pressable
                                key={t.key}
                                onPress={() => setActiveTab(t.key)}
                                style={[styles.tabButton, active && styles.tabButtonActive]}
                                accessibilityRole="button"
                                accessibilityState={{ selected: active }}
                                accessibilityLabel={`تبويب ${t.label}`}
                            >
                                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                                    {t.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Empty state before tab is selected */}
                {activeTab === null ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>اضغط على تبويب "أدعية الأنبياء" لعرض الأدعية</Text>
                    </View>
                ) : null}

                {/* Tab content */}
                {activeTab === "prophets" ? (
                    <>
                        {loadingFav ? (
                            <View style={{ padding: 20, alignItems: "center" }}>
                                <ActivityIndicator />
                            </View>
                        ) : null}

                        {PRAYERS.map((p) => {
                            const isFav = favorites.includes(p.id);
                            return (
                                <View key={p.id} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>{p.title}</Text>
                                    </View>

                                    <Text style={styles.arabicText}>{p.arabic}</Text>

                                    <View style={styles.metaRow}>
                                        <Ionicons name="book-outline" size={14} color="#6B7280" />
                                        <Text style={styles.reference}>{p.reference}</Text>
                                    </View>

                                    {p.note ? <Text style={styles.note}>🔹 {p.note}</Text> : null}

                                    <View style={styles.actionsRow}>
                                        <Pressable
                                            style={styles.actionButton}
                                            onPress={() => onCopy(p.id, `${p.title}\n\n${p.arabic}`)}
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
                                                    <Ionicons
                                                        name="share-social-outline"
                                                        size={18}
                                                        color="#065F46"
                                                    />
                                                    <Text style={styles.actionLabel}>مشاركة</Text>
                                                </>
                                            )}
                                        </Pressable>

                                        <Pressable
                                            style={styles.actionButton}
                                            onPress={() => toggleFavorite(p.id)}
                                            accessibilityLabel={`حفظ ${p.title}`}
                                        >
                                            <Ionicons
                                                name={isFav ? "bookmark" : "bookmark-outline"}
                                                size={18}
                                                color={isFav ? "#F59E0B" : "#6B7280"}
                                            />
                                            <Text
                                                style={[
                                                    styles.actionLabel,
                                                    isFav ? styles.favoritedLabel : undefined,
                                                ]}
                                            >
                                                {isFav ? "محفوظ" : "حفظ"}
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            );
                        })}
                    </>
                ) : null}

                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
}