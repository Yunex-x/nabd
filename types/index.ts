// Unified normalized content model used across adhkar / ad3iya / awrad.
export type ContentSource = "adkar" | "ad3iya" | "awrad";

export type NormalizedContentItem = {
  id: string;
  source: ContentSource;
  sourceKey: string;
  sourceId?: string | number;
  title?: string;
  text: string;
  section?: string;
  category?: string;
  tags?: string[];
  repetitions?: number;
  reference?: string;
  note?: string;
  favorite?: boolean;
  raw?: unknown;
};

// Backward-compatible alias for existing hooks/components.
export type Dhikr = NormalizedContentItem;

export type Routine = {
  id: string;
  name: string;
  items: string[]; // array of dhikr ids
};
