import { useQibla } from "@/hooks/useQibla";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

/**
 * Qibla screen
 *
 * - Uses useQibla() to get heading and qiblaBearing
 * - Animates a needle (or rotates the compass) so the needle points toward the Qibla
 *
 * Notes:
 * - Install: expo install expo-location expo-sensors
 * - Add route at app/qibla.tsx so router.push('/qibla') works
 */

export default function QiblaScreen() {
    const router = useRouter();
    const { loading, error, latitude, longitude, heading, qiblaBearing, distanceKm } = useQibla({
        magnetometerIntervalMs: 100,
    });

    // Animated rotation value (degrees)
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const lastRotation = useRef(0);

    // When heading or qiblaBearing changes, compute rotation needed:
    // We want the needle to point toward the Qibla. If needle graphic is pointing "up" (0deg),
    // rotation = qiblaBearing - heading.
    useEffect(() => {
        if (heading == null || qiblaBearing == null) return;

        let target = qiblaBearing - heading;
        // normalize to [-180, 180] to animate shortest path
        target = ((target + 540) % 360) - 180;

        // Smoothly animate rotation value (we keep it in degrees)
        Animated.timing(rotateAnim, {
            toValue: target,
            duration: 300,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
        }).start();

        lastRotation.current = target;
    }, [heading, qiblaBearing, rotateAnim]);

    const rotate = rotateAnim.interpolate({
        inputRange: [-180, 180],
        outputRange: ["-180deg", "180deg"],
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backText}>‹</Text>
                </Pressable>
                <Text style={styles.headerTitle}>اتجاه القبلة</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.container}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#0B84FF" />
                        <Text style={styles.statusText}>جلب الموقع وتهيئة البوصلة...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.center}>
                        <Text style={[styles.statusText, { color: "red" }]}>خطأ: {error}</Text>
                        <Text style={styles.smallText}>تأكد من تفعيل صلاحيات الموقع والأجهزة الحسية.</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.compassWrap}>
                            {/* Static compass ring */}
                            <View style={styles.compassRing}>
                                {/* N label */}
                                <Text style={[styles.cardinal, { top: 8 }]}>ش</Text>
                                <Text style={[styles.cardinal, { bottom: 8 }]}>ج</Text>
                                <Text style={[styles.cardinal, { left: 8, transform: [{ rotate: "-90deg" }] }]}>غ</Text>
                                <Text style={[styles.cardinal, { right: 8, transform: [{ rotate: "90deg" }] }]}>ش</Text>

                                {/* Animated needle (rotates to point toward Qibla) */}
                                <Animated.View style={[styles.needleContainer, { transform: [{ rotate }] }]}>
                                    <View style={styles.needleCenter} />
                                    <View style={styles.needle} />
                                </Animated.View>

                                {/* Qibla indicator (small circle/marker centered at top) */}
                                <View style={styles.qiblaMarker}>
                                    <Text style={styles.qiblaMarkerText}>قِبلة</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.info}>
                            <Text style={styles.infoText}>
                                إحداثياتك: {typeof latitude === "number" ? latitude.toFixed(5) : "--"}, {typeof longitude === "number" ? longitude.toFixed(5) : "--"}
                            </Text>
                            <Text style={styles.infoValue}>
                                زاوية القبلة: {qiblaBearing?.toFixed(1)}° — اتجاه جهازك: {heading?.toFixed(1)}°
                            </Text>
                            {typeof distanceKm === "number" ? (
                                <Text style={styles.infoValue}>المسافة إلى الكعبة: {distanceKm.toFixed(1)} كم</Text>
                            ) : null}

                            <Text style={styles.hint}>
                                وجه الجهاز حتى يصبح السهم ثابتًا على القبلة. قد تحتاج لتدوير الجهاز ببطء للتعديل.
                            </Text>
                        </View>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const COMPASS_SIZE = 300;
const NEEDLE_HEIGHT = 110;

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F7FBF6" },
    header: {
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    backText: { fontSize: 28, color: "#0B84FF" },
    headerTitle: { fontSize: 18, fontWeight: "700" },

    container: {
        flex: 1,
        alignItems: "center",
    },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    statusText: { marginTop: 12, fontSize: 16, color: "#333" },
    smallText: { marginTop: 6, color: "#666", fontSize: 13, textAlign: "center" },

    compassWrap: {
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
        width: COMPASS_SIZE,
        height: COMPASS_SIZE,
    },
    compassRing: {
        width: COMPASS_SIZE,
        height: COMPASS_SIZE,
        borderRadius: COMPASS_SIZE / 2,
        borderWidth: 6,
        borderColor: "#E6EEF8",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        // nice soft shadow
        shadowColor: "#0B84FF",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 18,
        elevation: 6,
    },

    cardinal: {
        position: "absolute",
        fontSize: 14,
        color: "#334155",
        fontWeight: "700",
    },

    needleContainer: {
        position: "absolute",
        width: COMPASS_SIZE,
        height: COMPASS_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },

    needleCenter: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#fff",
        borderWidth: 4,
        borderColor: "#0B84FF",
        zIndex: 5,
    },

    needle: {
        position: "absolute",
        width: 6,
        height: NEEDLE_HEIGHT,
        backgroundColor: "#0B84FF",
        borderRadius: 6,
        top: COMPASS_SIZE / 2 - NEEDLE_HEIGHT,
        // make the top half thinner taper if you want: we keep simple rectangle
    },

    qiblaMarker: {
        position: "absolute",
        top: 18,
        alignSelf: "center",
        backgroundColor: "#0B84FF",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    qiblaMarkerText: { color: "#fff", fontWeight: "700" },

    info: {
        marginTop: 18,
        width: "90%",
        alignItems: "center",
    },
    infoText: { color: "#475569", fontSize: 14 },
    infoValue: { marginTop: 6, fontWeight: "700", color: "#0B84FF" },
    hint: { marginTop: 12, color: "#64748B", textAlign: "center", lineHeight: 20 },
});