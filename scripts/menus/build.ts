import { select } from "@inquirer/prompts";
import { runSequential, runStep } from "../runner.js";
import { log } from "../ui/logger.js";
import { waitForEnter } from "../ui/pause.js";
import { showScreen } from "../ui/screen.js";

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
      message: "🔨 Build・Migration",
      choices: BUILD_CHOICES,
      loop: false,
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

    console.log("");
    await waitForEnter();
    showScreen("🔨 Build / Migration");
  }
}
