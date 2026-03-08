#!/usr/bin/env tsx
import { select } from "@inquirer/prompts";
import { devMenu } from "./menus/dev.js";
import { dockerMenu } from "./menus/docker.js";
import { testMenu } from "./menus/test.js";
import { runSequential } from "./runner.js";

const BANNER = `
_  ______  _       __  __ _____ _   _ _   _
| |/ /  _ \/ |     |  \/  | ____| \ | | | | |
| ' /| | | | |_____| |\/| |  _| |  \| | | | |
| . \| |_| | |_____| |  | | |___| |\  | |_| |
|_|\_\____/|_|     |_|  |_|_____|_| \_|\___/
`;

async function main(): Promise<void> {
  console.clear();
  console.log(BANNER);

  // TOP メニューループ
  while (true) {
    let choice: string;

    try {
      choice = await select({
        message: "何をしますか？",
        choices: [
          { name: "🚀 開発環境起動 (モードA / B)", value: "dev" },
          { name: "🐳 Docker操作", value: "docker" },
          { name: "🔨 ビルド・マイグレーション", value: "build" },
          { name: "🧪 テスト実行", value: "test" },
          { name: "❌ 終了", value: "exit" },
        ],
      });
    } catch {
      // Ctrl+C でも正常終了
      console.log("\nBye! 👋");
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

        case "test":
          await testMenu();
          break;

        case "exit":
          console.log("\nBye! 👋\n");
          process.exit(0);
      }
    } catch (err) {
      // コマンド失敗してもTOPに戻る
      console.error(`\n⚠️  エラーが発生しました。TOPメニューに戻ります。\n`);
    }

    // TOP へ戻る前に1秒待つ（結果を視認しやすくする）
    await new Promise((r) => setTimeout(r, 1000));
    console.clear();
    console.log(BANNER);
  }
}

async function buildMenu(): Promise<void> {
  const choice = await select({
    message: "🔨 ビルド・マイグレーション",
    choices: [
      { name: "全パッケージ ビルド", value: "build:all" },
      { name: "db-client ビルド（マイグレーション前処理）", value: "build:db" },
      { name: "DBマイグレーション実行", value: "migrate" },
      { name: "db-client ビルド + マイグレーション", value: "build:migrate" },
    ],
  });

  switch (choice) {
    case "build:all":
      await runSequential([{ label: "全パッケージ ビルド", cmd: "pnpm -r run build" }]);
      break;

    case "build:db":
      await runSequential([
        { label: "db-client ビルド", cmd: "pnpm --filter @kd1-labs/db-client... run build" },
      ]);
      break;

    case "migrate":
      await runSequential([
        { label: "DBマイグレーション", cmd: "pnpm --filter @kd1-labs/db-client run db:migrate" },
      ]);
      break;

    case "build:migrate":
      await runSequential([
        { label: "db-client ビルド", cmd: "pnpm --filter @kd1-labs/db-client... run build" },
        { label: "DBマイグレーション", cmd: "pnpm --filter @kd1-labs/db-client run db:migrate" },
      ]);
      break;
  }
}

main();
