/**
 * プロフィール Drizzle アダプタ
 * db-client の findUserByUserName / updateUser で ProfilePort を実装する
 */
import {
  findUserByUserName as dbFindUserByUserName,
  updateUser as dbUpdateUser,
} from "@kd1-labs/db-client";
import type { ProfilePort } from "../ports/profile.port";

export const profileDrizzleAdapter: ProfilePort = {
  async findUserByUserName(userName: string) {
    const row = await dbFindUserByUserName(userName);
    if (!row) return null;
    return { userId: row.userId };
  },
  async updateProfile(userId: string, input: { userName: string; screenName: string; avatarColor: string }) {
    await dbUpdateUser(userId, {
      userName: input.userName,
      screenName: input.screenName,
      avatarColor: input.avatarColor,
    });
  },
  async updatePassword(userId: string, passwordHash: string) {
    await dbUpdateUser(userId, {
      passwordHash,
      isInitialPassword: false,
    });
  },
};
