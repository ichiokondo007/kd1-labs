import { waitForEnter } from "@kd1-labs/devtool-cli";

export async function helpMenu(): Promise<void> {
  console.log(`
┌─────────────────────────────────────────────────┐
│  KD1 Cheat Sheet                                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ローカル開発 (infra Docker + ホスト実行)       │
│    $ docker compose up -d                       │
│    $ pnpm --filter server dev                   │
│    $ pnpm --filter client dev                   │
│                                                 │
│  フルDocker起動                                 │
│    $ docker compose -f docker-compose.yml \\      │
│        -f docker-compose.app.yml \\               │
│        --env-file .env.docker up --build -d     │
│                                                 │
│  ビルド・マイグレーション                       │
│    $ pnpm -r run build                          │
│    $ pnpm --filter @kd1-labs/db-client db:migrate│
│                                                 │
│  テスト                                         │
│    $ pnpm test                                  │
│    $ pnpm test:run                              │
│                                                 │
│  Storybook                                      │
│    $ pnpm --filter client storybook             │
│                                                 │
└─────────────────────────────────────────────────┘
`);

  await waitForEnter();
}
