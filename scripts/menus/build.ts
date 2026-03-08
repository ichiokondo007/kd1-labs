import { select } from "@inquirer/prompts";
import { runSequential, runStep } from "../runner.js";

export async function buildMenu(): Promise<void> {
  const choice = await select({
    message: "🔨 Build・Migration",
    choices: [
      { name: "全パッケージ ビルド", value: "build:all" },
      { name: "db-client ビルド（マイグレーション前処理）", value: "build:db" },
      { name: "DBマイグレーション実行", value: "migrate" },
      { name: "db-client ビルド + マイグレーション", value: "build:migrate" },
    ],
  });

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

    case "migrate":
      runStep({
        label: "DBマイグレーション",
        cmd: "pnpm --filter @kd1-labs/db-client run db:migrate",
      });
      break;

    case "build:migrate":
      runSequential([
        {
          label: "db-client ビルド",
          cmd: "pnpm --filter @kd1-labs/db-client... run build",
        },
        {
          label: "DBマイグレーション",
          cmd: "pnpm --filter @kd1-labs/db-client run db:migrate",
        },
      ]);
      break;
  }
}
