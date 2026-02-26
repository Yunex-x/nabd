import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

export default function TopBar() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer?.()}
          style={styles.circleBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="menu" size={18} color="#111827" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => console.log("Notifications")}
          style={styles.circleBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={18} color="#111827" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => console.log("Settings")}
          style={[styles.circleBtn, { marginLeft: "auto" }]}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-outline" size={18} color="#111827" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },

  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});