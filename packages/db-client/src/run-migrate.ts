/**
 * マイグレーション実行スクリプト。
 * 使用例: pnpm --filter @kd1-labs/db-client run db:migrate
 * 前提: DB が起動済み（例: docker compose up -d）、環境変数で接続先を指定可能。
 */
import { pool } from "./db.js";
import { runMigrations } from "./migrate.js";

async function main() {
  try {
    await runMigrations();
    console.log("[db-client] Migrations applied.");
  } catch (e) {
    console.error("[db-client] Migration failed:", e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
