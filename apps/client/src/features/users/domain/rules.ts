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