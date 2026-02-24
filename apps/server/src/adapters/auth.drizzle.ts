/**
 * 認証 Drizzle アダプタ
 * packages/db-client の findUserByUserName で DB からユーザーを取得し、AuthPort を実装する
 */
import { findUserByUserName as dbFindUserByUserName } from "@kd1-labs/db-client";
import type { AuthPort, AuthUserRecord } from "../ports/auth.port";

function toAuthUserRecord(row: {
  userId: string;
  userName: string;
  passwordHash: string;
  isInitialPassword: boolean;
  isAdmin: boolean;
}): AuthUserRecord {
  return {
    userId: row.userId,
    userName: row.userName,
    passwordHash: row.passwordHash,
    isInitialPassword: row.isInitialPassword,
    isAdmin: row.isAdmin,
  };
}

export const authDrizzleAdapter: AuthPort = {
  async findUserByUserName(userName: string): Promise<AuthUserRecord | null> {
    const row = await dbFindUserByUserName(userName);
    if (!row) return null;
    return toAuthUserRecord(row);
  },
};
