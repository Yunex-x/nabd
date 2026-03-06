/**
 * AI content index for the on-device assistant.
 *
 * Add the content items you want the assistant to use here.
 * The assistant will ONLY use items present in this file.
 *
 * Each entry follows the NormalizedContentItem shape used in the app:
 *  - id: unique string id
 *  - source: "adkar" | "ad3iya" | "awrad" (optional; freeform helps for source labels)
 *  - sourceKey: group key or category name (helps user see where item came from)
 *  - sourceId: optional original numeric id
 *  - title: short title (optional)
 *  - text: the main Arabic text (required)
 *  - section, category, tags, repetitions, reference, note: optional metadata
 *
 * Example entry provided below. Replace/add entries as needed.
 */

import { NormalizedContentItem } from "@/types";

export const AI_CONTENT: NormalizedContentItem[] = [
  {
    id: "adkar-saba7-1",
    source: "adkar",
    sourceKey: "saba7",
    sourceId: "1",
    title: "آية الكرسي",
    text: "﴿اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ... وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾",
    reference: "سورة البقرة، الآية 255",
    repetitions: 1,
    tags: ["saba7", "protection"],
  },

  {
    id: "ad3iya-istighfar-1",
    source: "ad3iya",
    sourceKey: "adk_istighfar",
    sourceId: "2",
    title: "دعاء الاستغفار المختصر",
    text: "اللهم اغفر لي وارحمني وعافني واعفُ عني",
    reference: "",
    repetitions: 1,
    tags: ["istighfar", "forgiveness"],
  },

  // Add more items below. Keep id unique. The assistant will only return content from this array.
];

export default AI_CONTENT;