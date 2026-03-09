import type { SvgAssetItem } from "../types";

export function sortByCreatedAtDesc(items: SvgAssetItem[]): SvgAssetItem[] {
  return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function validateTitle(title: string): { ok: true } | { ok: false; reason: string } {
  const t = title.trim();
  if (t.length === 0) return { ok: false, reason: "タイトルを入力してください" };
  if (t.length > 100) return { ok: false, reason: "タイトルは100文字以内にしてください" };
  return { ok: true };
}

export function validateSvgSource(source: string): { ok: true } | { ok: false; reason: string } {
  const s = source.trim();
  if (s.length === 0) return { ok: false, reason: "SVG ソースを入力してください" };
  if (!s.includes("<svg")) return { ok: false, reason: "有効な <svg> 要素が含まれていません" };
  return { ok: true };
}
