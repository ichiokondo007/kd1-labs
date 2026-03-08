#!/usr/bin/env tsx

import { select } from "@inquirer/prompts";

import { devMenu } from "./menus/dev.js";
import { dockerMenu } from "./menus/docker.js";
import { buildMenu } from "./menus/build.js";
import { helpMenu } from "./menus/help.js";

import { showScreen } from "./ui/screen.js";
import { log } from "./ui/logger.js";

async function main(): Promise<void> {
  showScreen();

  while (true) {
    let choice: string;

    try {
      choice = await select({
        message: "操作を選択してください",
        choices: [
          { name: "🚀 開発環境を起動", value: "dev" },
          { name: "🐳 Docker操作", value: "docker" },
          { name: "🔨 Build / Migration", value: "build" },
          { name: "🧪 HELP / Cheat Sheet", value: "help" },
          { name: "❌ Exit", value: "exit" },
        ],
      });
    } catch {
      log.warn("\nBye! 👋");
      process.exit(0);
    }

    if (choice === "exit") {
      log.info("\nBye! 👋\n");
      process.exit(0);
    }

    try {
      switch (choice) {
        case "dev":
          await devMenu();
          break;

        case "docker":
          await dockerMenu();
          break;

        case "build":
          await buildMenu();
          break;

        case "help":
          await helpMenu();
          break;
      }
    } catch {
      log.error("\n⚠ エラーが発生しました。TOPメニューに戻ります。\n");
    }

    await new Promise((r) => setTimeout(r, 800));

    showScreen();
  }
}

main();
