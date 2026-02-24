import type { SettingsItem } from "../types";

/**
 * domain は純関数中心（React非依存）
 */

// 例：表示用の並び替え（新しい順）
export function sortByCreatedAtDesc(items: SettingsItem[]): SettingsItem[] {
  // createdAt は ISO を想定（文字列比較でOK）。不明なら Date パースに切替。
  return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// 例：タイトルの最低条件（UIでのバリデーションにも利用可能）
export function validateTitle(title: string): { ok: true } | { ok: false; reason: string } {
  const t = title.trim();
  if (t.length === 0) return { ok: false, reason: "タイトルを入力してください" };
  if (t.length > 100) return { ok: false, reason: "タイトルは100文字以内にしてください" };
  return { ok: true };
}

/** ユーザー名必須チェック。1文字未満ならエラーメッセージを返す */
export function getRequiredUserNameError(userName: string): string | undefined {
  if (userName.trim().length === 0) return "This field is required.";
  return undefined;
}