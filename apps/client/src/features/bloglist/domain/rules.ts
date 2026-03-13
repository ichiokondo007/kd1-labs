import type { BloglistItem } from "../types";

/**
 * 日付の新しい順にソート（datetime: ISO date string）
 */
export function sortByDateDesc(items: BloglistItem[]): BloglistItem[] {
  return [...items].sort((a, b) => (a.datetime < b.datetime ? 1 : -1));
}
