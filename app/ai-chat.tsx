import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { NormalizedContentItem } from "@/types";
import AI_CONTENT from "./data/ai_content";

/**
 * AI chat screen (local retrieval-only assistant).
 * Uses the AI_CONTENT array (data/ai_content.ts) as the sole source of truth.
 * The assistant tokenizes queries and scores items by token frequency to return
 * relevant items quickly on-device.
 */

function scoreItem(item: NormalizedContentItem, tokens: string[]) {
  const hay = [
    item.title || "",
    item.text || "",
    item.section || "",
    item.category || "",
    item.reference || "",
    item.note || "",
    (item.tags || []).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const t of tokens) {
    if (!t) continue;
    const count = hay.split(t).length - 1;
    score += count;
  }
  return score;
}

export default function AIChatScreen() {
  const router = useRouter();
  const [index, setIndex] = useState<NormalizedContentItem[]>([]);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; text: string }[]>([]);

  useEffect(() => {
    // Load only the explicit AI content file
    setIndex(Array.isArray(AI_CONTENT) ? AI_CONTENT : []);
  }, []);

  const shortText = (t?: string) => {
    if (!t) return "";
    return t.length > 120 ? t.slice(0, 117) + "..." : t;
  };

  const handleSend = () => {
    const q = query.trim();
    if (!q) return;
    const userId = String(Date.now());
    setMessages((m) => [...m, { id: `u-${userId}`, role: "user", text: q }]);
    setQuery("");

    // Tokenize query (simple)
    const tokens = q
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 12);

    // Score items from AI_CONTENT only
    const scored = index
      .map((it) => ({ it, score: scoreItem(it, tokens) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    let assistantText = "";
    if (scored.length === 0) {
      assistantText = "لم أجد شيئًا مناسبًا في بيانات المساعد. حاول كلمات مفتاحية أخرى أو أضف المزيد من المحتوى في ملف data/ai_content.ts.";
    } else {
      assistantText = "وجدت المحتويات التالية من مصدر المساعد المحلي:\n\n";
      for (const s of scored) {
        const it = s.it;
        assistantText += `• ${it.title || it.section || "لا عنوان"} — ${shortText(it.text)}\n  مصدر: ${it.source || "local"} / ${it.sourceKey || "-"}${it.sourceId ? ` (${it.sourceId})` : ""}\n\n`;
      }
      assistantText += "اكتب نص النتيجة أو عنوانها لطلب التف��صيل، أو اطلب 'تفاصيل رقم X' إذا أردت.";
    }

    // simulate small delay for responsiveness
    setTimeout(() => {
      setMessages((m) => [...m, { id: `a-${userId}`, role: "assistant", text: assistantText }]);
    }, 200);
  };

  const renderMessage = ({ item }: { item: { id: string; role: "user" | "assistant"; text: string } }) => {
    return (
      <View style={[styles.msgRow, item.role === "user" ? styles.msgUser : styles.msgAssistant]}>
        <Text style={item.role === "user" ? styles.msgUserText : styles.msgAssistantText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>مساعد المحتوى (محلي)</Text>
      </View>

      <FlatList style={styles.messages} data={messages} keyExtractor={(i) => i.id} renderItem={renderMessage} contentContainerStyle={{ padding: 12 }} />

      <View style={styles.composer}>
        <TextInput
          placeholder="اسأل عن دعاء أو ذكر (سيُستخدم فقط محتوى data/ai_content.ts)"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          multiline
        />
        <Button title="أرسل" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 20, color: "#0B84FF" },
  title: { fontSize: 16, fontWeight: "700", marginLeft: 6 },

  messages: { flex: 1, backgroundColor: "#F7FBF6" },

  msgRow: { marginVertical: 6, padding: 12, borderRadius: 10, maxWidth: "90%" },
  msgUser: { alignSelf: "flex-end", backgroundColor: "#DCFCE7" },
  msgAssistant: { alignSelf: "flex-start", backgroundColor: "#fff" },
  msgUserText: { color: "#065F46" },
  msgAssistantText: { color: "#111" },

  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 140,
    padding: 10,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
});