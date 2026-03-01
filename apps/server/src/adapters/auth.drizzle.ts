/**
 * 認証 Drizzle アダプタ
 * packages/db-client の findUserByUserName で DB からユーザーを取得し、AuthPort を実装する
 */
import { findUserByUserName as dbFindUserByUserName } from "@kd1-labs/db-client";
import type { AuthPort, AuthUserRecord } from "../ports/auth.port";

function toAuthUserRecord(row: {
  userId: string;
  userName: string;
  screenName: string;
  passwordHash: string;
  isInitialPassword: boolean;
  isAdmin: boolean;
  avatarUrl: string | null;
  avatarColor: string;
}): AuthUserRecord {
  return {
    userId: row.userId,
    userName: row.userName,
    screenName: row.screenName,
    passwordHash: row.passwordHash,
    isInitialPassword: row.isInitialPassword,
    isAdmin: row.isAdmin,
    avatarUrl: row.avatarUrl ?? null,
    avatarColor: row.avatarColor ?? "zinc-900",
  };
}

export const authDrizzleAdapter: AuthPort = {
  async findUserByUserName(userName: string): Promise<AuthUserRecord | null> {
    const row = await dbFindUserByUserName(userName);
    if (!row) return null;
    return toAuthUserRecord(row);
  },
};
