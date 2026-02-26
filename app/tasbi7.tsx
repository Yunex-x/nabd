import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TopBar from "../components/TopBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const STORAGE_CURRENT = "tasbih_current_v1";
const STORAGE_TOTAL = "tasbih_total_v1";
const STORAGE_LAST = "tasbih_last_v1";

export default function Tasbi7Screen() {
  const insets = useSafeAreaInsets();

  const [current, setCurrent] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [last, setLast] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initializedRef = useRef(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Load persisted values on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [rawCurrent, rawTotal, rawLast] = await Promise.all([
          AsyncStorage.getItem(STORAGE_CURRENT),
          AsyncStorage.getItem(STORAGE_TOTAL),
          AsyncStorage.getItem(STORAGE_LAST),
        ]);
        if (!mounted) return;

        setCurrent(rawCurrent ? Number(rawCurrent) : 0);
        setTotal(rawTotal ? Number(rawTotal) : 0);
        setLast(rawLast ? Number(rawLast) : null);
      } catch (e) {
        console.warn("Failed to load tasbih data", e);
      } finally {
        if (mounted) {
          setLoading(false);
          initializedRef.current = true;
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist helpers
  const persistCurrent = async (value: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_CURRENT, String(value));
    } catch (e) {
      console.warn("Failed to persist current", e);
    }
  };

  const persistTotal = async (value: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_TOTAL, String(value));
    } catch (e) {
      console.warn("Failed to persist total", e);
    }
  };

  const persistLast = async (value: number | null) => {
    try {
      if (value === null) {
        await AsyncStorage.removeItem(STORAGE_LAST);
      } else {
        await AsyncStorage.setItem(STORAGE_LAST, String(value));
      }
    } catch (e) {
      console.warn("Failed to persist last", e);
    }
  };

  // Persist whenever values change, but only after initial load completes
  useEffect(() => {
    if (!initializedRef.current) return;
    persistCurrent(current);
  }, [current]);

  useEffect(() => {
    if (!initializedRef.current) return;
    persistTotal(total);
  }, [total]);

  useEffect(() => {
    if (!initializedRef.current) return;
    persistLast(last);
  }, [last]);

  // animations
  const animateTap = () => {
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
        easing: Easing.out(Easing.elastic(1)),
      }),
    ]).start();
  };

  // Increment handler — await persistence to reduce race issues
  const handleIncrement = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    animateTap();

    const nextCurrent = current + 1;
    const nextTotal = total + 1;

    setCurrent(nextCurrent);
    setTotal(nextTotal);

    try {
      await Promise.all([persistCurrent(nextCurrent), persistTotal(nextTotal)]);
    } catch (e) {
      console.warn("Error persisting on increment", e);
    }
  };

  // Reset current (save last)
  const handleReset = async () => {
    if (current === 0) {
      Alert.alert(
        "مسح الإحصائيات",
        "هل تود مسح الإجمالي والعدد الأخير؟",
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "نعم، امسح الكل",
            style: "destructive",
            onPress: async () => {
              setCurrent(0);
              setTotal(0);
              setLast(null);
              await Promise.all([persistCurrent(0), persistTotal(0), persistLast(null)]);
            },
          },
        ]
      );
      return;
    }

    const saved = current;
    setLast(saved);
    setCurrent(0);

    try {
      await Promise.all([persistLast(saved), persistCurrent(0)]);
    } catch (e) {
      console.warn("Error persisting on reset", e);
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  };

  // Long press reset: clear all (current, total, last)
  const handleLongPressReset = () => {
    Alert.alert(
      "تأكيد المسح",
      "هل تريد مسح العدد الحالي، الإجمالي، والعدد الأخير نهائيًا؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "مسح الكل",
          style: "destructive",
          onPress: async () => {
            setCurrent(0);
            setTotal(0);
            setLast(null);
            await Promise.all([persistCurrent(0), persistTotal(0), persistLast(null)]);
          },
        },
      ]
    );
  };

  const formatNumber = (n: number) => {
    if (n >= 1000) return n.toLocaleString();
    return String(n);
  };

  return (
    <View style={[localStyles.screen, { paddingTop: insets.top }]}>
      <TopBar />

      <View style={localStyles.container}>
        <Text style={localStyles.title}>تسبيح</Text>

        <View style={localStyles.infoRow}>
          <View style={localStyles.infoBox}>
            <Text style={localStyles.infoLabel}>الإجمالي</Text>
            <Text style={localStyles.infoValue}>{formatNumber(total)}</Text>
          </View>

          <View style={localStyles.infoBox}>
            <Text style={localStyles.infoLabel}>الأخير</Text>
            <Text style={localStyles.infoValue}>{last !== null ? String(last) : "-"}</Text>
          </View>
        </View>

        <View style={localStyles.circleWrap}>
          <Animated.View style={[localStyles.circle, { transform: [{ scale: scaleAnim }] }]}>
            <Pressable
              android_ripple={{ color: "rgba(0,0,0,0.06)", radius: 200 }}
              onPress={handleIncrement}
              accessibilityRole="button"
              accessibilityLabel="اضغط لزيادة التسبيح"
              style={localStyles.pressableFill}
            >
              <Text style={localStyles.currentCount}>{loading ? "…" : current}</Text>
              <Text style={localStyles.tapHint}>اضغط هنا للتسبيح</Text>
            </Pressable>
          </Animated.View>
        </View>

        <View style={localStyles.controlsRow}>
          <Pressable
            onPress={handleReset}
            onLongPress={handleLongPressReset}
            style={({ pressed }) => [
              localStyles.resetButton,
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="إعادة تعيين العدد الحالي"
          >
            <Ionicons name="refresh-outline" size={18} color="#065F46" />
            <Text style={localStyles.resetText}>إعادة ضبط</Text>
          </Pressable>
        </View>

        <View style={localStyles.footerNote}>
          <Text style={localStyles.footerText}>يتم حفظ العدد تلقائيًا. اضغط مطوّلًا على إعادة الضبط لمسح الكل.</Text>
        </View>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FAFAFB",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#065F46",
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  infoRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  infoBox: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6F4EF",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    textAlign: "center",
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  circleWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  circle: {
    width: 260,
    height: 260,
    borderRadius: 260 / 2,
    backgroundColor: "#fff",
    borderWidth: 10,
    borderColor: "#E6F4EF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  pressableFill: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  currentCount: {
    fontSize: 64,
    fontWeight: "900",
    color: "#065F46",
    lineHeight: 72,
    textAlign: "center",
  },
  tapHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },

  controlsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  resetText: {
    marginLeft: 8,
    color: "#065F46",
    fontWeight: "700",
  },

  footerNote: {
    marginTop: 18,
    paddingHorizontal: 8,
  },
  footerText: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
  },
});