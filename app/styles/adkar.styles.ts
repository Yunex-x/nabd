import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7FFF6" },
  content: { padding: 16, gap: 12 },

  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    marginBottom: 8,
  },

  backButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  backText: {
    color: "#065F46",
    fontWeight: "800",
    textAlign: "right",
  },

  screenTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#065F46",
    textAlign: "right",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#064E3B",
    textAlign: "right",
    marginBottom: 8,
  },

  // Empty state
  emptyState: {
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    fontSize: 14,
  },

  // Card (same visual style used for ad3iya/adkar items)
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#064E3B",
    textAlign: "right",
  },

  repeatPill: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  repeatText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },

  arabicText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: "right",
    writingDirection: "rtl",
    color: "#0F172A",
    marginBottom: 8,
  },

  note: {
    color: "#065F46",
    fontSize: 13,
    textAlign: "right",
    marginBottom: 6,
  },

  actionsRow: {
    marginTop: 6,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 18,
  },

  actionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },

  actionLabel: {
    fontSize: 13,
    color: "#065F46",
    textAlign: "right",
  },

  favoritedLabel: {
    color: "#F59E0B",
    fontWeight: "700",
  },

  /* Grouped surahs UI */
  groupContainer: {
    flexDirection: "row-reverse",
    gap: 8,
    marginBottom: 8,
  },

  smallSurahCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    alignItems: "flex-end",
  },

  smallSurahTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#064E3B",
    textAlign: "right",
  },

  smallSurahText: {
    marginTop: 8,
    fontSize: 14,
    color: "#0F172A",
    textAlign: "right",
    lineHeight: 20,
  },

  groupActionsRow: {
    marginTop: 8,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 16,
  },
});

export default styles;