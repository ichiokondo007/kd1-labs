import { select } from "@inquirer/prompts";
import { runSequential, runParallel } from "../runner.js";
import type { Command } from "../runner.js";

// ─── モード A: ローカル開発（インフラのみDocker）────────────────────────────

const MODE_A_STEPS: Command[] = [
  { label: "1. 依存インストール", cmd: "pnpm install" },
  { label: "2. 全パッケージビルド", cmd: "pnpm -r run build" },
  { label: "3. インフラ起動 (MySQL, MongoDB, MinIO)", cmd: "docker compose up -d" },
  {
    label: "4. DBマイグレーション",
    cmd: "pnpm --filter @kd1-labs/db-client run db:migrate",
  },
];

const MODE_A_DEV: Command[] = [
  { label: "server (dev)", cmd: "pnpm --filter server dev" },
  { label: "client (dev)", cmd: "pnpm --filter client dev" },
];

// ─── モード B: フルDocker ───────────────────────────────────────────────────

const MODE_B_STEPS: Command[] = [
  { label: "1. 依存インストール（マイグレーション実行用）", cmd: "pnpm install" },
  {
    label: "2. 全コンテナ起動 (イメージビルド含む)",
    cmd: "docker compose -f docker-compose.yml -f docker-compose.app.yml --env-file .env.docker up --build -d",
  },
  {
    label: "3. MySQL healthcheck 待機",
    cmd: "docker compose -f docker-compose.yml wait mysql",
  },
  {
    label: "4. db-client ビルド",
    cmd: "pnpm --filter @kd1-labs/db-client... run build",
  },
  {
    label: "5. DBマイグレーション",
    cmd: "pnpm --filter @kd1-labs/db-client run db:migrate",
  },
];

// ─── メニュー ──────────────────────────────────────────────────────────────

export async function devMenu(): Promise<void> {
  const choice = await select({
    message: "🚀 開発環境起動",
    choices: [
      { name: "━━ 🅐 ローカル開発モード（インフラのみDocker） ━━", value: "sep1", disabled: true },
      { name: "  ▶ 一括実行（install → build → infra up → migrate → dev起動）", value: "a:all" },
      { name: "  ▶ セットアップのみ（install → build → infra up → migrate）", value: "a:setup" },
      { name: "  ▶ Dev起動のみ（server + client 並列）", value: "a:dev" },
      { name: "━━ 🅑 フルDocker起動モード ━━", value: "sep2", disabled: true },
      { name: "  ▶ 一括実行（install → build → up → wait → migrate）", value: "b:all" },
    ],
  });

  switch (choice) {
    case "a:all":
      await runSequential(MODE_A_STEPS);
      console.log("\n📡 Dev サーバー並列起動...");
      runParallel(MODE_A_DEV);
      return; // TOP に戻らず、プロセスが生き続ける

    case "a:setup":
      await runSequential(MODE_A_STEPS);
      break;

    case "a:dev":
      runParallel(MODE_A_DEV);
      return; // 並列プロセス起動後は戻らない

    case "b:all":
      await runSequential(MODE_B_STEPS);
      break;
  }
}
