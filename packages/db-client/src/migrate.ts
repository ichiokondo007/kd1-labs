import * as fs from "node:fs";
import * as path from "node:path";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { db } from "./db.js";

/**
 * マイグレーション用フォルダ（db-schema の drizzle 出力）のパスを解決する。
 * モノレポでは packages/db-schema/drizzle、それ以外では node_modules 内を参照する。
 */
function getMigrationsFolder(): string {
  // ビルド後は dist/ から見て ../../db-schema/drizzle（モノレポ）
  const fromDist = path.join(__dirname, "..", "..", "db-schema", "drizzle");
  const journalPath = path.join(fromDist, "meta", "_journal.json");
  if (fs.existsSync(journalPath)) {
    return fromDist;
  }
  try {
    const pkgPath = require.resolve("@kd1-labs/db-schema/package.json", {
      paths: [__dirname],
    });
    return path.join(path.dirname(pkgPath), "drizzle");
  } catch {
    throw new Error(
      `Migrations not found: ${journalPath} not found and @kd1-labs/db-schema could not be resolved. Run from repo root or ensure db-schema is built.`
    );
  }
}

/**
 * Drizzle のマイグレーションを実行し、未適用の SQL を DB に適用する。
 * マイグレーション内容は packages/db-schema/drizzle を参照する。
 */
export async function runMigrations(): Promise<void> {
  const migrationsFolder = getMigrationsFolder();
  await migrate(db, { migrationsFolder });
}
