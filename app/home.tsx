// app/home.tsx
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import TopBar from "../components/TopBar";
import { usePrayerTimes } from "../hooks/usePrayerTimes";

type IoniconName = keyof typeof Ionicons.glyphMap;

function IconBadge({ name, bg }: { name: IoniconName; bg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Ionicons name={name} size={18} color="#111827" />
    </View>
  );
}

function MenuCard({
  title,
  subtitle,
  icon,
  badgeBg,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: IoniconName;
  badgeBg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuCard, pressed && styles.pressed]}
    >
      <IconBadge name={icon} bg={badgeBg} />
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-back" size={18} color="#9CA3AF" />
    </Pressable>
  );
}

export default function Home() {
  const router = useRouter();

  // Morocco-friendly defaults:
  // method 3 (MWL), school 0 (Shafi/Maliki)
  const { loading, error, timings, nextPrayer, countdown, nextKey } =
    usePrayerTimes({ method: 3, school: 0 });

  const arName: Record<string, string> = {
    Fajr: "الفجر",
    Sunrise: "الشروق",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء",
  };

  const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

  return (
    <View style={styles.container}>
      <TopBar />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Prayer Times Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.date}>اليوم</Text>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          </View>

          <Text style={styles.bigText}>تقبل الله طاعتكم</Text>

          {loading && (
            <Text style={styles.infoText}>جاري تحميل المواقيت…</Text>
          )}

          {error && (
            <Text style={styles.errorText}>
              {error} — فعّل GPS وجرّب
            </Text>
          )}

          {timings && (
            <>
              <Text style={styles.nextPrayerText}>
                الصلاة القادمة: {arName[nextPrayer?.key ?? ""]} بعد {countdown}
              </Text>

              <View style={styles.timesRow}>
                {order.map((key) => {
                  const isActive = key === nextKey;
                  return (
                    <View
                      key={key}
                      style={[styles.timePill, isActive && styles.activePill]}
                    >
                      <Text
                        style={isActive ? styles.timeTextActive : styles.timeText}
                      >
                        {timings[key]}
                      </Text>
                      <Text
                        style={
                          isActive ? styles.timeLabelActive : styles.timeLabel
                        }
                      >
                        {arName[key]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>الأقسام الرئيسية</Text>

        <MenuCard
          title="أذكار"
          subtitle="الصباح و المساء"
          icon="book-outline"
          badgeBg="#DBEAFE"
          onPress={() => router.push("/adkar")}
        />

        <MenuCard
          title="أوراد"
          subtitle="وردك اليومي"
          icon="library-outline"
          badgeBg="#EDE9FE"
          onPress={() => router.push("/awrad")}
        />

        <MenuCard
          title="تسبيح"
          subtitle="مسبحة إلكترونية"
          icon="finger-print-outline"
          badgeBg="#DCFCE7"
          onPress={() => router.push("/tasbi7")}
        />

        <MenuCard
          title="أدعية"
          subtitle="جوامع الدعاء"
          icon="add-outline"
          badgeBg="#FFEDD5"
          onPress={() => router.push("/ad3iya")}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E9EFE6" },
  content: { padding: 16, gap: 14 },

  // Card with shadow
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  cardHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  date: { textAlign: "right", color: "#6B7280", fontSize: 12 },

  bigText: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
    marginVertical: 10,
    color: "#111827",
  },

  infoText: { textAlign: "right", color: "#6B7280", marginBottom: 10 },
  errorText: { textAlign: "right", color: "#DC2626", marginBottom: 10 },

  nextPrayerText: {
    textAlign: "right",
    color: "#16a34a",
    fontWeight: "900",
    marginBottom: 10,
  },

  timesRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 8,
  },

  timePill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  activePill: { backgroundColor: "#9AD85B" },

  timeText: { fontWeight: "800", color: "#111827" },
  timeLabel: { fontSize: 11, color: "#6B7280", marginTop: 4 },

  timeTextActive: { fontWeight: "900", color: "#fff" },
  timeLabelActive: { fontSize: 11, color: "#fff", marginTop: 4 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
    color: "#111827",
  },

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