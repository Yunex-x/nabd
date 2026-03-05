import { Prayer } from "@/data/ad3iya";
import { AdkarItem } from "@/data/adkar";
import { ContentSource, NormalizedContentItem } from "@/types";

type StringRecord = Record<string, unknown>;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function firstString(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function asNumber(value: unknown, fallback = 1) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function stableHash(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(36);
}

function deterministicId(
  source: ContentSource,
  sourceKey: string,
  payload: {
    sourceId?: string | number;
    title?: string;
    text: string;
    section?: string;
  },
) {
  if (payload.sourceId !== undefined && payload.sourceId !== null) {
    return `${source}:${sourceKey}:${String(payload.sourceId)}`;
  }

  const fingerprint = normalizeWhitespace(
    `${source}|${sourceKey}|${payload.section ?? ""}|${payload.title ?? ""}|${payload.text}`,
  );
  return `${source}:${sourceKey}:${stableHash(fingerprint)}`;
}

export function normalizeAdkarItem(
  item: AdkarItem,
  sourceKey: string,
): NormalizedContentItem {
  const title = firstString(item.title);
  const text = firstString(item.arabic) ?? "";
  const section = sourceKey;
  const id = deterministicId("adkar", sourceKey, {
    sourceId: item.id,
    title,
    text,
    section,
  });

  return {
    id,
    source: "adkar",
    sourceKey,
    sourceId: item.id,
    title,
    text,
    section,
    category: sourceKey,
    repetitions: asNumber(item.repeat, 1),
    note: firstString(item.note),
    tags: [sourceKey],
    raw: item,
  };
}

export function normalizeAd3iyaItem(
  item: Prayer,
  sourceKey: string,
): NormalizedContentItem {
  const title = firstString(item.title);
  const text = firstString(item.arabic) ?? "";
  const section = sourceKey;
  const id = deterministicId("ad3iya", sourceKey, {
    sourceId: item.id,
    title,
    text,
    section,
  });

  return {
    id,
    source: "ad3iya",
    sourceKey,
    sourceId: item.id,
    title,
    text,
    section,
    category: sourceKey,
    repetitions: 1,
    reference: firstString(item.reference),
    note: firstString(item.note),
    tags: [sourceKey],
    raw: item,
  };
}

export type AwradRawItem = StringRecord & {
  id?: string | number;
  key?: string;
  uuid?: string;
  title?: string;
  name?: string;
  section?: string;
  category?: string;
  arabic?: string;
  text?: string;
  content?: string;
  body?: string;
  note?: string;
  source?: string;
  reference?: string;
  repeat?: number | string;
  count?: number | string;
  repetitions?: number | string;
  tags?: string[];
};

export function normalizeAwradItem(
  item: AwradRawItem,
  sourceKey = "default",
): NormalizedContentItem {
  const title = firstString(item.title, item.name);
  const text =
    firstString(item.arabic, item.text, item.content, item.body) ?? "";
  const section = firstString(item.section, item.category, sourceKey);
  const sourceId = item.id ?? item.uuid ?? item.key;

  const id = deterministicId("awrad", sourceKey, {
    sourceId,
    title,
    text,
    section,
  });

  const repetitions = asNumber(
    item.repeat ?? item.count ?? item.repetitions,
    1,
  );
  const rawTags = Array.isArray(item.tags)
    ? item.tags.filter(
        (tag): tag is string =>
          typeof tag === "string" && tag.trim().length > 0,
      )
    : [];

  return {
    id,
    source: "awrad",
    sourceKey,
    sourceId,
    title,
    text,
    section,
    category: firstString(item.category, sourceKey),
    repetitions,
    reference: firstString(item.reference, item.source),
    note: firstString(item.note),
    tags: rawTags.length > 0 ? rawTags : [sourceKey],
    raw: item,
  };
}
