import { select } from "@inquirer/prompts";

export async function devMenu(): Promise<void> {
  const choice = await select({
    message: "🚀 開発環境起動",
    choices: [
      { name: "モードA: ローカル開発（infra Docker + ホスト実行）", value: "local" },
      { name: "モードB: フルDocker開発（全コンテナ）", value: "full-docker" },
    ],
  });

  switch (choice) {
    case "local":
      // TODO: 仕様確定後に実装
      // 1. docker compose up -d (infra)
      // 2. pnpm install
      // 3. pnpm -r run build
      // 4. db:migrate
      // 5. pnpm --filter server dev & pnpm --filter client dev
      console.log("\n⚠️  モードA は未実装です\n");
      break;

    case "full-docker":
      // TODO: 仕様確定後に実装
      // 1. docker compose -f ... -f ... --env-file .env.docker up --build -d
      // 2. docker compose wait mysql
      // 3. db-client build + migrate
      console.log("\n⚠️  モードB は未実装です\n");
      break;
  }
}
