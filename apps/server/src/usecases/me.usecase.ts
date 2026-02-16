import type { User } from "@kd1-labs/types";

/**
 * 現在ユーザー取得（スタブ）
 * 将来はセッションから user_id を取得し Port 経由でユーザー情報を返す
 */
export async function getMeUsecase(): Promise<User> {
  return {
    id: "1",
    name: "Admin User",
    email: "admin@kd1labs.com",
    role: "admin",
  };
}
