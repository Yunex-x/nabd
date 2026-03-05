import TopBar from "@/components/TopBar";
import { normalizeAwradItem } from "@/utils/normalizeContent";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const AWRAD_RAW_ITEMS: Record<string, unknown>[] = [];

export default function Awrad() {
  const awradItems = useMemo(
    () => AWRAD_RAW_ITEMS.map((item) => normalizeAwradItem(item, "awrad")),
    [],
  );

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.itemTitle}>قائمة الأوراد</Text>
        {awradItems.length === 0 ? (
          <Text style={styles.itemSub}>لا توجد بيانات أوراد مهيكلة في المستودع حتى الآن.</Text>
        ) : (
          awradItems.map((item) => (
            <View key={item.id} style={styles.item}>
              <Text style={styles.itemTitle}>{item.title ?? "ورد"}</Text>
              <Text style={styles.itemSub}>{item.text}</Text>
            </View>
          ))
        )}
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