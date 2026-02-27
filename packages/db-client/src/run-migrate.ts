/**
 * マイグレーション実行スクリプト。
 * 使用例: pnpm --filter @kd1-labs/db-client run db:migrate
 * 前提: DB が起動済み（例: docker compose up -d）、環境変数で接続先を指定可能。
 *
 * 既に「適用済み」と記録されたマイグレーションが実際には失敗している場合:
 * DB の __drizzle_migrations テーブルから該当行を削除してから再実行する。
 */
import { pool } from "./db.js";
import { runMigrations, runSeeds } from "./migrate.js";

async function main() {
  try {
    await runMigrations();
    console.log("[db-client] Migrations applied.");
    await runSeeds();
    console.log("[db-client] Seeds applied.");
  } catch (e) {
    console.error("[db-client] Migration/seed failed:", e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
