import { execSync } from "node:child_process";
import { select } from "@inquirer/prompts";
import {
  runSequential,
  runStep,
  log,
  waitForEnter,
  showScreen,
  SELECT_PAGE_SIZE,
  SELECT_THEME,
} from "@kd1-labs/devtool-cli";

function getMysqlPort(): string {
  try {
    const out = execSync("docker port kd1-mysql 3306", { encoding: "utf-8" }).trim();
    const port = out.split("\n")[0]?.split(":").pop();
    if (port && /^\d+$/.test(port)) return port;
  } catch {
    log.warn("⚠ kd1-mysql コンテナからポートを取得できません。デフォルト 3307 を使用します。");
  }
  return "3307";
}

type BuildMenuValue =
  | "build:all"
  | "build:db"
  | "migrate"
  | "build:migrate"
  | "back"
  | "exit";

const BUILD_CHOICES = [
  { name: "全パッケージ ビルド", value: "build:all" as const },
  { name: "db-client ビルド（マイグレーション前処理）", value: "build:db" as const },
  { name: "DBマイグレーション実行", value: "migrate" as const },
  { name: "db-client ビルド + マイグレーション", value: "build:migrate" as const },
  { name: "↩ TOPへ戻る", value: "back" as const },
  { name: "❌ EXIT", value: "exit" as const },
];

export async function buildMenu(): Promise<void> {
  showScreen("🔨 Build / Migration");

  while (true) {
    console.log("");
    const choice = await select<BuildMenuValue>({
      message: "🔨 Select an action\n",
      choices: BUILD_CHOICES,
      loop: false,
      pageSize: SELECT_PAGE_SIZE,
      theme: SELECT_THEME,
    });

    if (choice === "back") return;
    if (choice === "exit") {
      log.info("\nBye! 👋\n");
      process.exit(0);
    }

    switch (choice) {
      case "build:all":
        runStep({ label: "全パッケージ ビルド", cmd: "pnpm -r run build" });
        break;

      case "build:db":
        runStep({
          label: "db-client ビルド",
          cmd: "pnpm --filter @kd1-labs/db-client... run build",
        });
        break;

      case "migrate": {
        const port = getMysqlPort();
        log.info(`🔌 DB_PORT=${port} (kd1-mysql)`);
        runStep(
          { label: "DBマイグレーション", cmd: "pnpm --filter @kd1-labs/db-client run db:migrate" },
          { env: { ...process.env, DB_PORT: port } },
        );
        break;
      }

      case "build:migrate": {
        const port = getMysqlPort();
        log.info(`🔌 DB_PORT=${port} (kd1-mysql)`);
        const migrateOpts = { env: { ...process.env, DB_PORT: port } };
        runSequential(
          [
            { label: "db-client ビルド", cmd: "pnpm --filter @kd1-labs/db-client... run build" },
            { label: "DBマイグレーション", cmd: "pnpm --filter @kd1-labs/db-client run db:migrate" },
          ],
          migrateOpts,
        );
        break;
      }
    }

    console.log("");
    await waitForEnter();
    showScreen("🔨 Build / Migration");
  }
}
