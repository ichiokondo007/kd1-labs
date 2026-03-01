import { eq } from "drizzle-orm";
import type { UserInsert, UserRow } from "@kd1-labs/db-schema";
import { db, schema } from "../db.js";

const { users } = schema;

/**
 * user_name でユーザーを 1 件取得する（ログイン照合用）
 */
export async function findUserByUserName(userName: string): Promise<UserRow | null> {
  const rows = await db.select().from(users).where(eq(users.userName, userName)).limit(1);
  return rows[0] ?? null;
}

/**
 * user_id でユーザーを 1 件取得する
 */
export async function findUserById(userId: string): Promise<UserRow | null> {
  const rows = await db.select().from(users).where(eq(users.userId, userId)).limit(1);
  return rows[0] ?? null;
}

/**
 * ユーザーを 1 件登録する。userId は呼び出し側で生成して渡す。
 */
export async function insertUser(data: UserInsert): Promise<UserRow> {
  await db.insert(users).values(data);
  const row = await findUserById(data.userId);
  if (!row) throw new Error("insertUser: 登録後の取得に失敗しました");
  return row;
}

/**
 * user_id をキーにユーザーを更新する。指定したカラムのみ更新可能。
 */
export async function updateUser(
  userId: string,
  data: Partial<Omit<UserInsert, "userId">>
): Promise<UserRow | null> {
  await db.update(users).set(data).where(eq(users.userId, userId));
  return findUserById(userId);
}

/** 一覧取得用（password_hash は含めない） */
export type ListUserRow = {
  userId: string;
  userName: string;
  screenName: string;
  isAdmin: boolean;
  avatarUrl: string | null;
  avatarColor: string;
};

/**
 * ユーザー一覧を取得する。管理者画面用。password_hash は返さない。
 */
export async function listUsers(): Promise<ListUserRow[]> {
  const rows = await db
    .select({
      userId: users.userId,
      userName: users.userName,
      screenName: users.screenName,
      isAdmin: users.isAdmin,
      avatarUrl: users.avatarUrl,
      avatarColor: users.avatarColor,
    })
    .from(users);
  return rows.map((r) => ({
    userId: r.userId,
    userName: r.userName,
    screenName: r.screenName,
    isAdmin: r.isAdmin,
    avatarUrl: r.avatarUrl ?? null,
    avatarColor: r.avatarColor ?? "zinc-900",
  }));
}
