import * as fs from "node:fs";
import * as path from "node:path";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { pool } from "./db.js";
import { db } from "./db.js";

/**
 * マイグレーション用フォルダ（db-schema の drizzle 出力）のパスを解決する。
 * 必ず @kd1-labs/db-schema パッケージの drizzle を参照する（モノレポ・pnpm どちらでも動く）。
 */
function getMigrationsFolder(): string {
  try {
    const pkgPath = require.resolve("@kd1-labs/db-schema/package.json", {
      paths: [__dirname, process.cwd()],
    });
    const folder = path.join(path.dirname(pkgPath), "drizzle");
    const journalPath = path.join(folder, "meta", "_journal.json");
    if (!fs.existsSync(journalPath)) {
      throw new Error(`Journal not found: ${journalPath}`);
    }
    return path.resolve(folder);
  } catch (e) {
    const fromDist = path.resolve(__dirname, "..", "..", "db-schema", "drizzle");
    const journalPath = path.join(fromDist, "meta", "_journal.json");
    if (fs.existsSync(journalPath)) {
      return fromDist;
    }
    throw new Error(
      `Migrations not found: ${e instanceof Error ? e.message : String(e)}. Ensure @kd1-labs/db-schema has drizzle/ and meta/_journal.json.`
    );
  }
}

/**
 * シード用フォルダ（drizzle/seeds）のパスを返す。
 * マイグレーションと同じ db-schema/drizzle 配下の seeds を参照する。
 */
function getSeedsFolder(): string {
  const migrationsFolder = getMigrationsFolder();
  return path.join(migrationsFolder, "seeds");
}

/**
 * drizzle/seeds/*.sql をファイル名の昇順で実行する。
 * seeds フォルダが存在しない、または .sql が一つもない場合は何もしない。
 */
export async function runSeeds(): Promise<void> {
  const seedsFolder = getSeedsFolder();
  if (!fs.existsSync(seedsFolder)) {
    return;
  }
  const files = fs.readdirSync(seedsFolder).filter((f) => f.endsWith(".sql"));
  if (files.length === 0) {
    return;
  }
  files.sort();
  for (const file of files) {
    const filePath = path.join(seedsFolder, file);
    const sql = fs.readFileSync(filePath, "utf-8").trim();
    if (!sql) continue;
    await pool.query(sql);
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
