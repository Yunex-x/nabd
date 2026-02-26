import { StyleSheet } from "react-native";

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

export default styles;