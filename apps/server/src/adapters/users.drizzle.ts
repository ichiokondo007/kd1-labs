/**
 * ユーザー一覧 Drizzle アダプタ
 * db-client の listUsers で UsersPort を実装する
 */
import { listUsers as dbListUsers } from "@kd1-labs/db-client";
import type { UsersPort } from "../ports/users.port";

export const usersDrizzleAdapter: UsersPort = {
  async listUsers() {
    return dbListUsers();
  },
};
