import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ImageSourcePropType,
  I18nManager,
} from "react-native";

type BottomBarProps = {
  onQiblaPress?: () => void;
  onNearestMosquePress?: () => void;
  onCenterPress?: () => void;
  /**
   * Optional logo shown in the center.
   * Pass an Image source like: require("../assets/logo.png")
   */
  logo?: ImageSourcePropType | null;
  backgroundColor?: string;
  accentColor?: string;
  barHeight?: number;
};

export default function BottomBar({
  onQiblaPress,
  onNearestMosquePress,
  onCenterPress,
  logo = null,
  backgroundColor = "#fff",
  accentColor = "#0B84FF",
  barHeight = 66,
}: BottomBarProps) {
  const isRTL = I18nManager.isRTL;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.container, { backgroundColor, height: barHeight }]}>
        <Pressable
          style={styles.sideButton}
          onPress={onQiblaPress}
          android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}
          accessibilityLabel="اتجاه القبلة"
        >
          <Text style={styles.icon}>🧭</Text>
          <Text style={styles.label}>القبلة</Text>
        </Pressable>

        {/* Center logo placed inline (center of the bar) */}
        <Pressable
          style={[styles.centerContainer, { borderColor: accentColor }]}
          onPress={onCenterPress}
          android_ripple={{ color: "rgba(11,132,255,0.12)", borderless: true }}
          accessibilityLabel="شعار التطبيق"
        >
          {logo ? (
            <Image source={logo} style={styles.logoImage} resizeMode="cover" />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>App</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={styles.sideButton}
          onPress={onNearestMosquePress}
          android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}
          accessibilityLabel="أقرب مسجد"
        >
          <Text style={styles.icon}>🕌</Text>
          <Text style={styles.label}>أقرب مسجد</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const CENTER_SIZE = 48;

const styles = StyleSheet.create({
  safeArea: {
    width: "100%",
  },
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  sideButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: "#222",
    writingDirection: "rtl",
  },
  centerContainer: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    // small shadow/elevation to make center logo pop slightly
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  logoPlaceholder: {
    width: CENTER_SIZE - 8,
    height: CENTER_SIZE - 8,
    borderRadius: (CENTER_SIZE - 8) / 2,
    backgroundColor: "#f0f3ff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 12,
    color: "#0B84FF",
    fontWeight: "700",
  },
  logoImage: {
    width: CENTER_SIZE - 6,
    height: CENTER_SIZE - 6,
    borderRadius: (CENTER_SIZE - 6) / 2,
  },
});