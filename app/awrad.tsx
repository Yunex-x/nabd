import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import TopBar from "../components/TopBar";

// Ensure TopBar accepts a 'title' prop
type TopBarProps = { title: string };

// If TopBar is a function component, re-declare it here for type safety (temporary fix)
// Remove this if TopBar already accepts props correctly in its own file
// const TopBar: React.FC<TopBarProps> = (props) => <View><Text>{props.title}</Text></View>;
const items = [
  { key: "assab7", title: "ورد الصباح", subtitle: "سورة الواقعة" },
  { key: "almasae", title: "ورد المساء", subtitle: "سورة يس" },
  { key: "allil", title: "ورد الليل", subtitle: "سورة الجن + سورة الملك" },
];

export default function AwradMenu() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* @ts-expect-error Temporary: TopBar should accept 'title' prop. Remove this line if fixed in TopBar component. */}
      <TopBar title="الأوراد" />

      <View style={styles.content}>
        {items.map((it) => (
          <Pressable
            key={it.key}
            onPress={() => router.push({ pathname: "/awrad", params: { key: it.key } })}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <Text style={styles.itemTitle}>{it.title}</Text>
            <Text style={styles.itemSub}>{it.subtitle}</Text>
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
    gap: 6,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  itemTitle: { fontSize: 16, fontWeight: "800", textAlign: "right" },
  itemSub: { fontSize: 14, opacity: 0.7, textAlign: "right", lineHeight: 20 },
});