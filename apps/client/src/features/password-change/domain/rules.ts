import type { PasswordChangeItem } from "../types";

/**
 * domain は純関数中心（React非依存）
 */

// 例：表示用の並び替え（新しい順）
export function sortByCreatedAtDesc(items: PasswordChangeItem[]): PasswordChangeItem[] {
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

const MIN_PASSWORD_LENGTH = 8;

/** パスワード変更フォームの検証（長さ・一致） */
export function validatePasswordChangeForm(
  newPassword: string,
  confirmPassword: string
): { ok: true } | { ok: false; message: string } {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, message: "New password and confirmation do not match." };
  }
  return { ok: true };
}