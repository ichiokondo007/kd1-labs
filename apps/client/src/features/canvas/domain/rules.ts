import type { CanvasListItem } from "../types";

/**
 * domain は純関数中心（React非依存）
 */

export function sortByUpdatedAtDesc(items: CanvasListItem[]): CanvasListItem[] {
  return [...items].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function validateCanvasName(name: string): string | undefined {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "Canvas Name is required.";
  if (trimmed.length > 100) return "Canvas Name must be 100 characters or less.";
  return undefined;
}