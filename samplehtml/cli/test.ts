import { select, input } from "@inquirer/prompts";
import { runSync } from "../runner.js";

export async function testMenu(): Promise<void> {
  const choice = await select({
    message: "🧪 テスト実行",
    choices: [
      { name: "全 workspace — watch モード", value: "all:watch" },
      { name: "全 workspace — 1回実行 (CI向け)", value: "all:run" },
      { name: "filter 指定 — watch モード", value: "filter:watch" },
      { name: "filter 指定 — 1回実行", value: "filter:run" },
    ],
  });

  switch (choice) {
    case "all:watch":
      runSync("pnpm test");
      break;

    case "all:run":
      runSync("pnpm test:run");
      break;

    case "filter:watch": {
      const filter = await input({ message: "フィルター名 (例: client / @kd1-labs/utils):" });
      runSync(`pnpm --filter ${filter} test`);
      break;
    }

    case "filter:run": {
      const filter = await input({ message: "フィルター名 (例: client / @kd1-labs/utils):" });
      runSync(`pnpm --filter ${filter} test:run`);
      break;
    }
  }
}
