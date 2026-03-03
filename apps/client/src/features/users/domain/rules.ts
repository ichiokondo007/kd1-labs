import type { UsersItem } from "../types";

/**
 * domain は純関数中心（React非依存）
 */

/** 表示用の並び替え（ユーザー名昇順） */
export function sortByUserName(items: UsersItem[]): UsersItem[] {
  return [...items].sort((a, b) =>
    a.userName.localeCompare(b.userName, undefined, { sensitivity: "base" })
  );
}

/** UserName 必須チェック（Settings 画面と同じ文言） */
export function getRequiredUserNameError(userName: string): string | undefined {
  if (userName.trim().length === 0) return "This field is required.";
  return undefined;
}

/** Screen Name 必須チェック（Settings 画面と同じ文言） */
export function getRequiredScreenNameError(screenName: string): string | undefined {
  if (screenName.trim().length === 0) return "This field is required.";
  return undefined;
}