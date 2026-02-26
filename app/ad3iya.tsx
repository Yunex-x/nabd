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
import styles from "./styles/ad3iya.styles";

type Prayer = {
    id: number;
    title: string;
    arabic: string;
    reference?: string;
    note?: string;
};

const MENU_ITEMS = [
    { key: "prophets", title: "أدعية الأنبياء", subtitle: "أدعية مأثورة عن الأنبياء", icon: "people-outline", badgeBg: "#FCE7F3" },
    { key: "adkhulkhruj", title: "دعاء دخول وخروج", subtitle: "أدعية الدخول والخروج", icon: "enter-outline", badgeBg: "#E6FFFA" },
    { key: "adk_kurb", title: "دعاء الكرب والشدائد", subtitle: "أدعية في الكرب والشدائد", icon: "alert-circle-outline", badgeBg: "#FFE4E6" },
    { key: "adk_istighfar", title: "دعاء الاستغفار", subtitle: "أدعية الاستغفار والتوبة", icon: "repeat-outline", badgeBg: "#E0F2FE" },
];

// --- Prophets (existing list) ---
const PRAYERS_PROPHETS: Prayer[] = [
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
            "﴿رَبِّ اشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِي أَمْرِي ۝ وَاحْلُلْ عُقْدَةً مِن لِّ��َانِي ۝ يَفْقَهُوا قَوْلِي﴾",
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

// --- دخول وخروج (useful texts, can be extended) ---
const PRAYERS_DUKHOL_KHROUJ: Prayer[] = [
    {
        id: 101,
        title: "دعاء الخروج من البيت",
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ.",
        note: "يُقال عند الخروج من البيت أو الانطلاق في السفر.",
    },
    {
        id: 102,
        title: "دعاء دخول المسجد",
        arabic: "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.",
        note: "يُقال عند دخول المسجد.",
    },
    {
        id: 103,
        title: "دعاء الخروج من المسجد",
        arabic: "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي لِسَانِي نُورًا، وَاجْعَلْ فِي سَمْعِي نُورًا، وَاجْعَلْ فِي بَصَرِي نُورًا، اللَّهُمَّ أَعْطِنِي نُورًا.",
        note: "يمكن قولها عند الخروج من المسجد أو عند الدخول.",
    },
    {
        id: 104,
        title: "أعوذ بالله من الشيطان",
        arabic: "اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ.",
        note: "دعاء لطلب الحماية من وساوس الشيطان.",
    },
];

// --- الكرب والشدائد ---
const PRAYERS_KARB: Prayer[] = [
    {
        id: 201,
        title: "لا إله إلا أنت (يونس)",
        arabic: "لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
        reference: "سورة الأنبياء، الآية 87",
        note: "من أعظم أدعية تفريج الكرب.",
    },
    {
        id: 202,
        title: "دعاء أيوب صبرًا وفرجًا",
        arabic: "﴿أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ﴾",
        reference: "سورة الأنبياء، الآية 83",
        note: "دعاء عند المرض والابتلاء.",
    },
    {
        id: 203,
        title: "دعاء استنقاذ من الشدة",
        arabic: "اللهم اكشف عنا الكرب والبلاء وارزقنا فرجًا قريبًا.",
        note: "صيغة عامة يمكن الدعاء بها في الشدائد.",
    },
];

// --- الاستغفار والتوبة ---
const PRAYERS_ISTIGHFAR: Prayer[] = [
    {
        id: 301,
        title: "أستغفر الله ثلاثًا",
        arabic: "أستغفرُ اللهَ",
        note: "يُقال: 3 مرات أو ما تيسر.",
    },
    {
        id: 302,
        title: "اللهم اغفر لي",
        arabic: "اللهم اغفر لي وارحمني وتب عليَّ إنك أنت التواب الرحيم.",
        note: "دعاء استغفار وتوبة موسع.",
    },
    {
        id: 303,
        title: "أستغفر الله من كل ذنب",
        arabic: "أستغفرُ اللهَ من كل ذنبٍ أذنبتُهُ وعن كل خطأٍ قصَرْتُ فيه.",
        note: "صيغة عامة للاستغفار.",
    },
];

// Group mapping
const PRAYERS_GROUPS: Record<string, Prayer[]> = {
    prophets: PRAYERS_PROPHETS,
    adkhulkhruj: PRAYERS_DUKHOL_KHROUJ,
    adk_kurb: PRAYERS_KARB,
    adk_istighfar: PRAYERS_ISTIGHFAR,
};

export default function Ad3iyaScreen() {
    const [activeKey, setActiveKey] = useState<string | null>(null); // null = show menu
    const [favorites, setFavorites] = useState<number[]>([]);
    const [loadingFav, setLoadingFav] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [sharingId, setSharingId] = useState<number | null>(null);

    const favoritesKeyFor = useCallback((key: string) => `ad3iya_${key}_favorites_v1`, []);

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

    const onShare = async (p: Prayer) => {
        try {
            setSharingId(p.id);
            await Share.share({
                message: `${p.title}\n\n${p.arabic}${p.reference ? `\n\n${p.reference}` : ""}`,
            });
        } catch (e) {
            console.warn("Share error", e);
        } finally {
            setSharingId(null);
        }
    };

    const renderListForKey = (key: string) => {
        const list = PRAYERS_GROUPS[key] ?? [];
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

                            <Text style={styles.arabicText}>{p.arabic}</Text>

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
                                    onPress={() => onCopy(p.id, `${p.title}\n\n${p.arabic}${p.reference ? `\n\n${p.reference}` : ""}`)}
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