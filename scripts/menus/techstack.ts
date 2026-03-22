import { runStep, waitForEnter } from "@kd1-labs/devtool-cli";

export async function techstackMenu(): Promise<void> {
  runStep({ label: "Tech Stack (依存ライブラリ一覧)", cmd: "pnpm tsx scripts/list-deps.ts" });
  await waitForEnter();
}
