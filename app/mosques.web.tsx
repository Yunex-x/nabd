import { useNearestMosques } from "@/hooks/useNearestMosques";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function NearestMosquesWebScreen() {
    const router = useRouter();

    const [userLoc, setUserLoc] = useState<{ lat: number; lon: number } | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (!mounted) return;

                if (status !== "granted") {
                    setLocationError("صلاحيات الموقع مرفوضة");
                    setLoadingLocation(false);
                    return;
                }

                const pos = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Highest,
                });
                if (!mounted) return;

                setUserLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            } catch (e: any) {
                if (!mounted) return;
                setLocationError(e?.message || "فشل الحصول على الموقع");
            } finally {
                if (!mounted) return;
                setLoadingLocation(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const radius = 5000;
    const { loading: loadingPlaces, places, error: placesError } = useNearestMosques(
        userLoc?.lat ?? null,
        userLoc?.lon ?? null,
        radius
    );

    function openDirections(destLat: number, destLon: number) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLon}&travelmode=walking`;
        Linking.openURL(url).catch(() => {
            const fallback = `https://www.google.com/maps/search/?api=1&query=${destLat},${destLon}`;
            Linking.openURL(fallback).catch(() => {
                // ignore
            });
        });
    }

    return (
        <View style={styles.safeArea}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>‹</Text>
                </Pressable>
                <Text style={styles.title}>أقرب مساجد</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.container}>
                {loadingLocation ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#0B84FF" />
                        <Text style={styles.note}>جلب الموقع...</Text>
                    </View>
                ) : locationError ? (
                    <View style={styles.center}>
                        <Text style={[styles.note, { color: "red" }]}>{locationError}</Text>
                        <Text style={styles.smallText}>تأكد من تفعيل صلاحيات الموقع للمتصفح.</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.webBanner}>
                            <Text style={styles.webBannerText}>عرض الخريطة غير متاح على الويب في هذه الصفحة.</Text>
                            <Text style={styles.webBannerSub}>يمكنك فتح كل مسجد مباشرة في خرائط Google.</Text>
                        </View>

                        <View style={styles.listWrap}>
                            <View style={styles.listHeader}>
                                <Text style={styles.listTitle}>المساجد القريبة</Text>
                                <Text style={styles.listSubtitle}>
                                    {places.length} نتيجة — ضمن {radius / 1000} كم
                                </Text>
                            </View>

                            {loadingPlaces ? (
                                <ActivityIndicator style={{ marginTop: 12 }} />
                            ) : placesError ? (
                                <Text style={[styles.note, { color: "red", marginTop: 12 }]}>{placesError}</Text>
                            ) : places.length === 0 ? (
                                <Text style={[styles.note, { marginTop: 12 }]}>لم يتم العثور على مساجد في المنطقة.</Text>
                            ) : (
                                <FlatList
                                    data={places}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
                                    renderItem={({ item }) => (
                                        <View style={styles.placeCard}>
                                            <Text style={styles.placeName}>{item.name}</Text>
                                            <Text style={styles.placeDist}>{(item.distanceMeters / 1000).toFixed(2)} كم</Text>
                                            <Pressable style={styles.directionBtn} onPress={() => openDirections(item.lat, item.lon)}>
                                                <Text style={styles.directionText}>الاتجاه</Text>
                                            </Pressable>
                                        </View>
                                    )}
                                />
                            )}
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F7FBF6" },
    header: {
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        justifyContent: "space-between",
    },
    backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    backText: { fontSize: 28, color: "#0B84FF" },
    title: { fontSize: 18, fontWeight: "700" },

    container: { flex: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    note: { marginTop: 12, color: "#374151", textAlign: "center" },
    smallText: { marginTop: 6, color: "#64748B", textAlign: "center" },

    webBanner: {
        marginHorizontal: 12,
        marginTop: 8,
        padding: 12,
        borderRadius: 10,
        backgroundColor: "#E6EEF8",
    },
    webBannerText: { color: "#0F172A", fontWeight: "700", textAlign: "right" },
    webBannerSub: { marginTop: 4, color: "#475569", textAlign: "right" },

    listWrap: { flex: 1, marginTop: 8 },
    listHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12 },
    listTitle: { fontSize: 16, fontWeight: "800" },
    listSubtitle: { fontSize: 12, color: "#64748B", alignSelf: "center" },

    placeCard: {
        marginTop: 10,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 3,
    },
    placeName: { fontWeight: "800", fontSize: 14, textAlign: "right" },
    placeDist: { marginTop: 6, color: "#0B84FF", fontWeight: "700", textAlign: "right" },

    directionBtn: {
        marginTop: 10,
        alignSelf: "flex-end",
        backgroundColor: "#065F46",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    directionText: { color: "#fff", fontWeight: "800" },
});
