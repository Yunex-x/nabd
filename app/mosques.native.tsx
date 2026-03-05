import { useNearestMosques } from "@/hooks/useNearestMosques";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const mapsModule = (() => {
    try {
        return require("react-native-maps");
    } catch {
        return null;
    }
})();

const MapView = (mapsModule?.default ?? View) as any;
const Marker = (mapsModule?.Marker ?? (() => null)) as any;
const PROVIDER_GOOGLE = mapsModule?.PROVIDER_GOOGLE;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function NearestMosquesNativeScreen() {
    const router = useRouter();

    const [userLoc, setUserLoc] = useState<{ lat: number; lon: number } | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);

    const mapRef = useRef<typeof MapView | null>(null);

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
                const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
                if (!mounted) return;
                setUserLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            } catch (e: any) {
                if (!mounted) return;
                setLocationError(e.message || "فشل الحصول على الموقع");
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

    const initialRegion = userLoc
        ? {
            latitude: userLoc.lat,
            longitude: userLoc.lon,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
        }
        : {
            latitude: 21.4225,
            longitude: 39.8262,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
        };

    function openDirections(destLat: number, destLon: number) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLon}&travelmode=walking`;
        Linking.openURL(url).catch(() => {
            const geo = `geo:${destLat},${destLon}`;
            Linking.openURL(geo).catch(() => {
                // ignore
            });
        });
    }

    function centerOnPlace(lat: number, lon: number) {
        if (!mapRef.current) return;
        mapRef.current.animateToRegion(
            {
                latitude: lat,
                longitude: lon,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
            },
            400
        );
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
                        <Text style={styles.smallText}>تأكد من تفعيل صلاحيات الموقع للتطبيق.</Text>
                    </View>
                ) : (
                    <>
                        <MapView
                            ref={(r: any) => {
                                mapRef.current = r;
                            }}
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            initialRegion={initialRegion}
                            showsUserLocation
                            showsMyLocationButton
                            loadingEnabled
                        >
                            {userLoc ? (
                                <Marker coordinate={{ latitude: userLoc.lat, longitude: userLoc.lon }} title="موقعك" />
                            ) : null}

                            {places.map((p) => (
                                <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lon }} title={p.name} />
                            ))}
                        </MapView>

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
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 12 }}
                                    renderItem={({ item }) => (
                                        <Pressable
                                            style={styles.placeCard}
                                            onPress={() => {
                                                centerOnPlace(item.lat, item.lon);
                                            }}
                                        >
                                            <Text style={styles.placeName}>{item.name}</Text>
                                            <Text style={styles.placeDist}>{(item.distanceMeters / 1000).toFixed(2)} كم</Text>
                                            <View style={styles.placeActions}>
                                                <Pressable style={styles.directionBtn} onPress={() => openDirections(item.lat, item.lon)}>
                                                    <Text style={styles.directionText}>الاتجاه</Text>
                                                </Pressable>
                                            </View>
                                        </Pressable>
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
    note: { marginTop: 12, color: "#374151" },
    smallText: { marginTop: 6, color: "#64748B", textAlign: "center" },

    map: { width: "100%", height: "65%" },

    listWrap: {
        height: 140,
        backgroundColor: "transparent",
        marginTop: 8,
    },
    listHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12 },
    listTitle: { fontSize: 16, fontWeight: "800" },
    listSubtitle: { fontSize: 12, color: "#64748B", alignSelf: "center" },

    placeCard: {
        width: SCREEN_WIDTH * 0.62,
        marginHorizontal: 8,
        marginTop: 8,
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
    placeDist: { marginTop: 6, color: "#0B84FF", fontWeight: "700" },
    placeActions: { marginTop: 10, flexDirection: "row", justifyContent: "flex-end" },

    directionBtn: {
        backgroundColor: "#065F46",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    directionText: { color: "#fff", fontWeight: "800" },
});
