import { AppBackground } from "@/constants/theme";
import * as Notifications from "expo-notifications";
import { Slot } from "expo-router";
import React, { useEffect } from "react";
import { Platform, StatusBar, View } from "react-native";
import "react-native-get-random-values";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function SafeAreaLayout() {
  const insets = useSafeAreaInsets();
  const appBg = AppBackground.light;

  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0B84FF",
      });
    }
  }, []);

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