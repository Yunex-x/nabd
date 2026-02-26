import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import TopBar from "@/components/TopBar";

export default function Awrad() {
  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.itemTitle}>قائمة الأوراد</Text>
        {/* ... */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // let layout supply background
  container: { flex: 1, backgroundColor: "transparent" },
  content: { padding: 16, gap: 10 },
  item: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#fff",
    gap: 6,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  itemTitle: { fontSize: 16, fontWeight: "800", textAlign: "right" },
  itemSub: { fontSize: 14, opacity: 0.7, textAlign: "right", lineHeight: 20 },
});