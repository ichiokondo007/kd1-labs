import { execSync, type ExecSyncOptions } from "node:child_process";
import type { Step } from "./types.js";

const defaultOpts: ExecSyncOptions = {
  cwd: process.cwd(),
  stdio: "inherit",
  env: { ...process.env, FORCE_COLOR: "1" },
};

/** 単一ステップを実行（ラベル + コマンド表示） */
export function runStep(step: Step, opts?: ExecSyncOptions): void {
  console.log(`\n▶ ${step.label}`);
  console.log(`  $ ${step.cmd}`);
  execSync(step.cmd, { ...defaultOpts, ...opts });
}

/** 複数ステップを直列実行（進捗番号付き、1つ失敗で中断） */
export function runSequential(steps: Step[], opts?: ExecSyncOptions): void {
  const total = steps.length;
  for (let i = 0; i < total; i++) {
    const step = steps[i];
    console.log(`\n▶ [${i + 1}/${total}] ${step.label}`);
    console.log(`  $ ${step.cmd}`);
    execSync(step.cmd, { ...defaultOpts, ...opts });
  }
  console.log(`\n✅ ${total} ステップ完了`);
}
