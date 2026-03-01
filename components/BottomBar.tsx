import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";

type BottomBarProps = {
  onQiblaPress?: () => void;
  onNearestMosquePress?: () => void;
  onCenterPress?: () => void;
  logo?: ImageSourcePropType | null;
  backgroundColor?: string;
  accentColor?: string;
  centerSize?: number;
  barHeight?: number;
};

export default function BottomBar({
  onQiblaPress,
  onNearestMosquePress,
  onCenterPress,
  logo = null,
  backgroundColor = "#ffffff",
  accentColor = "#0B84FF",
  centerSize = 92,
  barHeight = 72,
}: BottomBarProps) {
  const CENTER = centerSize;
  const innerSize = CENTER - 14; // size of inner white circle that holds the image

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.container, { height: barHeight, backgroundColor }]}>
        <Pressable
          style={styles.sideButton}
          onPress={onQiblaPress}
          android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}
          accessibilityLabel="اتجاه القبلة"
        >
          <Text style={styles.icon}>🧭</Text>
          <Text style={styles.label}>القبلة</Text>
        </Pressable>

        {/* spacer keeps left/right buttons spaced while the floating circle is absolutely centered */}
        <View style={{ width: CENTER }} />

        <Pressable
          style={styles.sideButton}
          onPress={onNearestMosquePress}
          android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}
          accessibilityLabel="أقرب مسجد"
        >
          <Text style={styles.icon}>🕌</Text>
          <Text style={styles.label}>أقرب مسجد</Text>
        </Pressable>

        {/* Floating center logo: absolutely centered using left 50% and a dynamic translateX */}
        <View
          style={[
            styles.centerWrap,
            {
              width: CENTER,
              height: CENTER,
              top: -(CENTER / 2),
              left: "50%",
              transform: [{ translateX: -CENTER / 2 }],
            },
          ]}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={onCenterPress}
            style={[styles.centerPressable, { width: CENTER, height: CENTER, borderRadius: CENTER / 2 }]}
            android_ripple={{ color: "rgba(11,132,255,0.12)", borderless: true }}
            accessibilityLabel="شعار التطبيق"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {/* inner circular surface (white) holds the image and receives shadow/elevation */}
            <View
              style={[
                styles.innerCircle,
                {
                  width: innerSize,
                  height: innerSize,
                  borderRadius: innerSize / 2,
                  borderColor: accentColor,
                },
              ]}
            >
              {logo ? (
                <Image
                  source={logo}
                  style={{
                    width: innerSize,
                    height: innerSize,
                    borderRadius: innerSize / 2,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.logoPlaceholder,
                    { width: innerSize, height: innerSize, borderRadius: innerSize / 2 },
                  ]}
                >
                  <Text style={styles.logoText}>App</Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: "100%",
    overflow: "visible", // ensure floating item isn't clipped
  },
  container: {
    width: "100%",
    position: "relative", // centerWrap is positioned relative to this
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
    overflow: "visible",
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

  centerWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },

  centerPressable: {
    alignItems: "center",
    justifyContent: "center",
    // no background here, innerCircle renders the white circular surface
  },

  innerCircle: {
    backgroundColor: "#fff",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    // iOS shadow:
    shadowColor: "#0B84FF",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    // Android elevation:
    elevation: 12,
  },

  logoPlaceholder: {
    backgroundColor: "#f0f3ff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 14,
    color: "#0B84FF",
    fontWeight: "800",
  },
});