import { runStep } from "../runner.js";
import { waitForEnter } from "../ui/pause.js";

export async function techstackMenu(): Promise<void> {
  runStep({ label: "Tech Stack (依存ライブラリ一覧)", cmd: "pnpm tsx scripts/list-deps.ts" });
  await waitForEnter();
}
