/**
 * 認証スタブアダプタ
 * 認証ユーザー情報を取得する
 *
 * @param userId ユーザーID
 * @returns ユーザー情報
 */

import type { AuthPort, AuthUserRecord } from "../ports/auth.port";

/**
 * DB未接続の暫定スタブ（開発用）
 * - 本番は MySQL/ORM 実装へ差し替える
 */
const USERS: AuthUserRecord[] = [
  {
    userId: "admin",
    userName: "Admin User",
    passwordHash: "plain:password", // スタブ用の擬似hash
    isInitialPassword: 0,
    isAdmin: 1,
  },
];

export const authStubAdapter: AuthPort = {
  async findUserByUserId(userId: string) {
    return USERS.find((u) => u.userId === userId) ?? null;
  },
};
