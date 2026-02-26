import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;

function IconBadge({ name, bg }: { name: IoniconName; bg: string }) {
  return (
    <View style={[localStyles.badge, { backgroundColor: bg }]}>
      <Ionicons name={name} size={18} color="#111827" />
    </View>
  );
}

export default function MenuCard({
  title,
  subtitle,
  icon,
  badgeBg,
  onPress,
}: {
  title: string;
  subtitle?: string;
  icon: IoniconName;
  badgeBg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [localStyles.menuCard, pressed && localStyles.pressed]}
    >
      <IconBadge name={icon} bg={badgeBg} />
      <View style={{ flex: 1 }}>
        <Text style={localStyles.menuTitle}>{title}</Text>
        {subtitle ? <Text style={localStyles.menuSub}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-back" size={18} color="#9CA3AF" />
    </Pressable>
  );
}

const localStyles = StyleSheet.create({
  menuCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    marginBottom: 12,
  },
  pressed: { transform: [{ scale: 0.99 }], opacity: 0.95 },

  badge: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
    color: "#111827",
  },
  menuSub: {
    fontSize: 13,
    textAlign: "right",
    color: "#6B7280",
    marginTop: 4,
  },
});