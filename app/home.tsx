import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import TopBar from "@/components/TopBar";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TopBar title="تطبيق إسلامي" />

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>القائمة الرئيسية</Text>

        <View style={styles.grid}>
          <Pressable
            onPress={() => router.push("/adkar")}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <Ionicons name="book-outline" size={28} />
            <Text style={styles.cardTitle}>الأذكار</Text>
            <Text style={styles.cardDesc}>أذكار الصباح والمساء والنوم…</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/awrad")}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <Ionicons name="moon-outline" size={28} />
            <Text style={styles.cardTitle}>الأوراد</Text>
            <Text style={styles.cardDesc}>ورد الصباح / المساء / الليل</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/tasbi7")}
            style={({ pressed }) => [
              styles.card,
              styles.cardWide,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.row}>
              <Ionicons name="finger-print-outline" size={28} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>عدّاد التسبيح</Text>
                <Text style={styles.cardDesc}>عداد رقمي للتسبيح مع زر كبير</Text>
              </View>
              <Ionicons name="chevron-back" size={22} />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", textAlign: "right" },

  grid: { gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#fff",
    gap: 8,
  },
  cardWide: {
    paddingVertical: 16,
  },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },

  cardTitle: { fontSize: 18, fontWeight: "800", textAlign: "right" },
  cardDesc: { fontSize: 14, opacity: 0.7, textAlign: "right", lineHeight: 20 },

  row: { flexDirection: "row", alignItems: "center", gap: 12 },
});