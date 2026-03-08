import { select } from "@inquirer/prompts";
import { runSequential, runSync } from "../runner.js";

const INFRA_UP: import("../runner.js").Command[] = [
  { label: "インフラ起動 (MySQL, MongoDB, MinIO)", cmd: "docker compose up -d" },
];

const INFRA_DOWN: import("../runner.js").Command[] = [
  { label: "インフラ停止", cmd: "docker compose down" },
];

const INFRA_CLEAN: import("../runner.js").Command[] = [
  { label: "インフラ削除 (volume + image含む)", cmd: "docker compose down -v --rmi all" },
];

const APP_UP: import("../runner.js").Command[] = [
  {
    label: "全コンテナ起動 (イメージビルド含む)",
    cmd: "docker compose -f docker-compose.yml -f docker-compose.app.yml --env-file .env.docker up --build -d",
  },
  { label: "MySQL healthcheck 待機", cmd: "docker compose -f docker-compose.yml wait mysql" },
  {
    label: "db-client ビルド (マイグレーション用)",
    cmd: "pnpm --filter @kd1-labs/db-client... run build",
  },
  {
    label: "DBマイグレーション実行",
    cmd: "pnpm --filter @kd1-labs/db-client run db:migrate",
  },
];

const APP_DOWN: import("../runner.js").Command[] = [
  {
    label: "フルApp停止",
    cmd: "docker compose -f docker-compose.yml -f docker-compose.app.yml down",
  },
];

export async function dockerMenu(): Promise<void> {
  const choice = await select({
    message: "🐳 Docker操作",
    choices: [
      { name: "━━ インフラ (MySQL / MongoDB / MinIO) ━━", value: "sep1", disabled: true },
      { name: "  ▶ up  — インフラ起動", value: "infra:up" },
      { name: "  ▶ down — インフラ停止", value: "infra:down" },
      { name: "  ▶ clean — volume/image含め削除", value: "infra:clean" },
      { name: "━━ フルDocker App (client + server) ━━", value: "sep2", disabled: true },
      { name: "  ▶ up --build — 全コンテナ起動", value: "app:up" },
      { name: "  ▶ down — フルApp停止", value: "app:down" },
    ],
  });

  switch (choice) {
    case "infra:up":
      await runSequential(INFRA_UP);
      break;
    case "infra:down":
      await runSequential(INFRA_DOWN);
      break;
    case "infra:clean":
      await runSequential(INFRA_CLEAN);
      break;
    case "app:up":
      await runSequential(APP_UP);
      break;
    case "app:down":
      await runSequential(APP_DOWN);
      break;
  }
}
