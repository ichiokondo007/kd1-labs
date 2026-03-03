/**
 * 新規ユーザー作成 Drizzle アダプタ
 * user_name 一意チェック → UUID 発番 → 固定パスワードをハッシュ → INSERT
 */
import { findUserByUserName, insertUser } from "@kd1-labs/db-client";
import { generateUUIDv7 } from "@kd1-labs/utils";
import type { CreateUserPort, CreateUserResult } from "../ports/create-user.port";
import { bcryptPasswordHasher } from "./password-hasher.bcrypt";

const FIXED_INITIAL_PASSWORD = "password";

export const createUserDrizzleAdapter: CreateUserPort = {
  async createUser(userName: string, screenName: string): Promise<CreateUserResult> {
    const existing = await findUserByUserName(userName);
    if (existing) {
      return {
        ok: false,
        code: "DUPLICATE_USER_NAME",
        message: "This UserName is already registered.",
      };
    }
    const userId = generateUUIDv7();
    const passwordHash = await bcryptPasswordHasher.hash(FIXED_INITIAL_PASSWORD);
    await insertUser({
      userId,
      userName,
      screenName,
      passwordHash,
      isInitialPassword: true,
      isAdmin: false,
    });
    return { ok: true, userId, userName };
  },
};
