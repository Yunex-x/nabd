import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // let layout supply the app background
  container: { flex: 1, backgroundColor: "transparent" },
  content: { padding: 16, gap: 12 },

  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    marginBottom: 8,
  },

  screenTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#065F46",
    textAlign: "right",
  },

  tabBar: {
    flexDirection: "row-reverse",
    gap: 8,
    marginBottom: 12,
  },

  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "transparent",
  },

  tabButtonActive: {
    backgroundColor: "#065F46",
  },

  tabLabel: {
    fontSize: 14,
    color: "#065F46",
    textAlign: "right",
    fontWeight: "800",
  },

  tabLabelActive: {
    color: "#FFFFFF",
  },

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

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
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
    fontSize: 16,
    fontWeight: "900",
    color: "#064E3B",
    textAlign: "right",
  },

  arabicText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: "right",
    writingDirection: "rtl",
    color: "#0F172A",
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },

  reference: {
    color: "#6B7280",
    fontSize: 13,
    textAlign: "right",
  },

  note: {
    color: "#065F46",
    fontSize: 13,
    textAlign: "right",
    marginTop: 6,
  },

  actionsRow: {
    marginTop: 8,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
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
});

export default styles;