import {
  boolean,
  datetime,
  mysqlTable,
  varchar,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  userId: varchar("user_id", { length: 64 }).primaryKey(),
  userName: varchar("user_name", { length: 64 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isInitialPassword: boolean("is_initial_password").notNull().default(true),
  isAdmin: boolean("is_admin").notNull().default(false),
  avatarUrl: varchar("avatar_url", { length: 512 }),
  avatarColor: varchar("avatar_color", { length: 20 })
    .notNull()
    .default("zinc-900"),
  // DATETIME(3): default のみ Drizzle で指定。ON UPDATE はマイグレーションで付与するか手動で追加
  updatedAt: datetime("updated_at", { fsp: 3, mode: "date" })
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP(3))`),
});

/** users テーブルの 1 行（SELECT 結果） */
export type UserRow = typeof users.$inferSelect;

/** users テーブルへの INSERT 用（省略時は default が使われる） */
export type UserInsert = typeof users.$inferInsert;
