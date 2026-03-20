#!/usr/bin/env tsx

import { select } from "@inquirer/prompts";

import { devMenu } from "./menus/dev.js";
import { dockerMenu } from "./menus/docker.js";
import { buildMenu } from "./menus/build.js";
import { helpMenu } from "./menus/help.js";
import { techstackMenu } from "./menus/techstack.js";

import { log } from "./ui/logger.js";
import { SELECT_PAGE_SIZE, SELECT_THEME } from "./ui/prompt-config.js";
import { showScreen } from "./ui/screen.js";

async function main(): Promise<void> {
  showScreen();

  while (true) {
    let choice: string;

    try {
      choice = await select({
        message: "Select an action\n",
        choices: [
          { name: "🚀 Open Development Environment", value: "dev" },
          { name: "🐳 Docker Operation ", value: "docker" },
          { name: "🔨 Build / DB Migration (Build / DB Migration)", value: "build" },
          { name: "📦 Tech Stack", value: "techstack" },
          { name: "🧪 HELP / Cheat Sheet", value: "help" },
          { name: "❌ Exit(終了)", value: "exit" },
        ],
        loop: false,
        pageSize: SELECT_PAGE_SIZE,
        theme: SELECT_THEME,
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

        case "techstack":
          await techstackMenu();
          break;

        case "help":
          await helpMenu();
          break;
      }
    } catch {
      log.error("\n⚠ エラーが発生しました。TOPメニューに戻ります。\n");
    }

    showScreen();
  }
}

main();
