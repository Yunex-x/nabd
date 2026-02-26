import React from "react";
import { View, StatusBar, Platform } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { AppBackground } from "@/constants/theme";

function SafeAreaLayout() {
  const insets = useSafeAreaInsets();
  const appBg = AppBackground.light;

  return (
    <View style={{ flex: 1, backgroundColor: appBg }}>
      <StatusBar
        translucent
        backgroundColor={appBg}
        barStyle="dark-content"
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