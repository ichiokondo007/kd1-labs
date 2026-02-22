/**
 * 認証スタブアダプタ
 * user_name でユーザーを検索する（開発用スタブ）
 *
 * @param userName ログイン名
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
    userName: "admin",
    passwordHash: "plain:password", // スタブ用の擬似hash
    isInitialPassword: false, // true にするとログイン後は必ず /password-change へ
    isAdmin: true,
  },
];

export const authStubAdapter: AuthPort = {
  async findUserByUserName(userName: string) {
    return USERS.find((u) => u.userName === userName) ?? null;
  },
};
