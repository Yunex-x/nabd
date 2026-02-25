import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import TopBar from "../components/TopBar";

const items = [
  { key: "saba7", title: "أذكار الصباح" },
  { key: "masae", title: "أذكار المساء" },
  { key: "nawm", title: "أذكار النوم" },
  { key: "masjid", title: "أذكار المسجد" },
  { key: "isti9ad", title: "أذكار الاستيقاظ" },
  { key: "assalat", title: "أذكار الصلاة" },
];

export default function AdkarMenu() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TopBar title="الأذكار" />

      <View style={styles.content}>
        {items.map((it) => (
          <Pressable
            key={it.key}
            onPress={() => router.push(`/adkar/${it.key}`)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <Text style={styles.itemText}>{it.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, gap: 10 },
  item: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#fff",
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  itemText: { fontSize: 16, fontWeight: "700", textAlign: "right" },
});