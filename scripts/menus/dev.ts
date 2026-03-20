import { select } from "@inquirer/prompts";
import { runForeground } from "../runner.js";
import { runFullDocker } from "../services/dev.service.js";
import { log } from "../ui/logger.js";
import { waitForEnter } from "../ui/pause.js";
import { SELECT_PAGE_SIZE, SELECT_THEME } from "../ui/prompt-config.js";
import { showScreen } from "../ui/screen.js";

type DevMenuValue = "full-docker" | "server" | "client" | "yjsserver" | "back" | "exit";

const DEV_CHOICES = [
  { name: " 🔷 一括起動/git clone後の初回用 ( Full Docker run）", value: "full-docker" as const },
  {
    name: " 🟢 Server Process起動 apps/server run dev（Build → run）",
    value: "server" as const,
  },
  {
    name: " 🟣 Cliant Process起動 apps/client run dev（Build → run）",
    value: "client" as const,
  },
  {
    name: " 🟡 Yjs-server Process起動 apps/yjs-server run dev（Build → run）",
    value: "yjsserver" as const,
  },
  { name: " ↩️ TOPへ戻る", value: "back" as const },
  { name: " ❌ EXIT", value: "exit" as const },
];

const PREPARE_AND_RUN = {
  server: {
    buildLabel: "server 依存パッケージ ビルド",
    buildCmd: "pnpm --filter @kd1-labs/db-client... run build",
    runLabel: "apps/server dev server 起動",
    runCmd: "pnpm --filter server dev",
  },
  client: {
    buildLabel: "client 依存パッケージ ビルド",
    buildCmd: "pnpm --filter @kd1-labs/types run build",
    runLabel: "apps/client dev server 起動",
    runCmd: "pnpm --filter client dev",
  },
  yjsserver: {
    buildLabel: "yjs-server 依存パッケージ ビルド",
    buildCmd: "pnpm --filter yjs-server run build",
    runLabel: "apps/yjs-server dev server 起動",
    runCmd: "pnpm --filter yjs-server dev",
  },
} as const;

async function startDevServer(target: "server" | "client" | "yjsserver"): Promise<void> {
  const cfg = PREPARE_AND_RUN[target];

  log.info(`\n📦 ${cfg.buildLabel}...`);
  const { runSequential } = await import("../runner.js");
  runSequential([{ label: cfg.buildLabel, cmd: cfg.buildCmd }]);

  log.success(`\n✅ ビルド完了 → ${cfg.runLabel} を開始します`);
  const code = await runForeground({ label: cfg.runLabel, cmd: cfg.runCmd });

  console.log(`\n🛑 dev server 終了 (code: ${code})`);
  process.exit(0);
}



export async function devMenu(): Promise<void> {
  showScreen("🚀 Open Development Environment");

  while (true) {
    console.log("");
    const choice = await select<DevMenuValue>({
      message: "🚀 Select an actio\n",
      choices: DEV_CHOICES,
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
      case "full-docker":
        await runFullDocker();
        break;

      case "server":
        await startDevServer("server");
        return;

      case "client":
        await startDevServer("client");
        return;

      case "yjsserver":
        await startDevServer("yjsserver");
        return;
    }

    console.log("");
    await waitForEnter();
    showScreen("🚀 開発環境起動");
  }
}
