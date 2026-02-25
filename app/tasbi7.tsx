import TopBar from "@/components/TopBar";
import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function Tasbi7() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <TopBar title="عدّاد التسبيح" />

      <View style={styles.content}>
        <Text style={styles.count}>{count}</Text>

        <Pressable style={styles.bigBtn} onPress={() => setCount((c) => c + 1)}>
          <Text style={styles.bigBtnText}>سبّح</Text>
        </Pressable>

        <Pressable style={styles.reset} onPress={() => setCount(0)}>
          <Text style={styles.resetText}>إعادة التصفير</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 16 },
  count: { fontSize: 64, fontWeight: "900" },
  bigBtn: {
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
  },
  bigBtnText: { color: "#fff", fontSize: 22, fontWeight: "900" },
  reset: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  resetText: { fontSize: 14, fontWeight: "700" },
});