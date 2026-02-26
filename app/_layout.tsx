import React from "react";
import { View, StatusBar, Platform } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { AppBackground } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

function SafeAreaLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const appBg = AppBackground[colorScheme as "light" | "dark"] ?? AppBackground.light;

  return (
    <View style={{ flex: 1, backgroundColor: appBg }}>
      <StatusBar
        translucent
        backgroundColor={appBg}
        barStyle={Platform.OS === "ios" ? "dark-content" : "dark-content"}
      />

      {/* top spacer (same color as app background) */}
      <View style={{ height: insets.top, backgroundColor: appBg }} />

      {/* main app content area */}
      <View style={{ flex: 1, backgroundColor: appBg, paddingLeft: insets.left, paddingRight: insets.right }}>
        <Slot />
      </View>

      {/* bottom spacer (same color as app background) */}
      <View style={{ height: insets.bottom, backgroundColor: appBg }} />
    </View>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <SafeAreaLayout />
    </SafeAreaProvider>
  );
}