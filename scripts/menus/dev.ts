import { select } from "@inquirer/prompts";
import { log } from "../ui/logger.js";
import { waitForEnter } from "../ui/pause.js";
import { showScreen } from "../ui/screen.js";

type DevMenuValue = "full-docker" | "local" | "back" | "exit";

const DEV_CHOICES = [
  { name: "モードA: フルDocker開発（全コンテナ）", value: "full-docker" as const },
  {
    name: "モードB: ローカル開発（infra Docker + 「apps/client/server」ホスト実行）",
    value: "local" as const,
  },
  { name: "↩ TOPへ戻る", value: "back" as const },
  { name: "❌ EXIT", value: "exit" as const },
];

export async function devMenu(): Promise<void> {
  showScreen("🚀 開発環境起動");

  while (true) {
    console.log("");
    const choice = await select<DevMenuValue>({
      message: "🚀 開発環境起動(すぐに動かして確認したい場合は「モードA」で実行してください)",
      choices: DEV_CHOICES,
      loop: false,
    });

    if (choice === "back") return;
    if (choice === "exit") {
      log.info("\nBye! 👋\n");
      process.exit(0);
    }

    switch (choice) {
      case "full-docker":
        // TODO: 仕様確定後に実装
        // 1. docker compose -f ... -f ... --env-file .env.docker up --build -d
        // 2. docker compose wait mysql
        // 3. db-client build + migrate
        log.warn("\n⚠️  モードA は未実装です");
        break;

      case "local":
        // TODO: 仕様確定後に実装
        // 1. docker compose up -d (infra)
        // 2. pnpm install
        // 3. pnpm -r run build
        // 4. db:migrate
        // 5. pnpm --filter server dev & pnpm --filter client dev
        log.warn("\n⚠️  モードB は未実装です");
        break;
    }

    console.log("");
    await waitForEnter();
    showScreen("🚀 開発環境起動");
  }
}
