import { findUserById as dbFindUserById } from "@kd1-labs/db-client";
import type { UserLookupPort } from "../ports/canvas.port";

export const userMysqlAdapter: UserLookupPort = {
  async findUserById(userId: string) {
    const row = await dbFindUserById(userId);
    if (!row) return null;
    return {
      screenName: row.screenName,
      avatarUrl: row.avatarUrl ?? null,
      avatarColor: row.avatarColor ?? "zinc-900",
    };
  },
};
