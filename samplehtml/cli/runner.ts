import { spawn, execSync } from "node:child_process";

export type RunMode = "inherit" | "spawn";

export interface Command {
  label: string;
  cmd: string;
  cwd?: string;
}

/**
 * 単一コマンドを同期実行（stdout/stderr をそのまま流す）
 */
export function runSync(cmd: string, cwd = process.cwd()): void {
  console.log(`\n▶ ${cmd}\n`);
  try {
    execSync(cmd, { stdio: "inherit", cwd });
  } catch {
    console.error(`\n❌ コマンド失敗: ${cmd}`);
    throw new Error(`FAILED: ${cmd}`);
  }
}

/**
 * 複数コマンドを順次実行
 */
export async function runSequential(commands: Command[]): Promise<void> {
  for (const { label, cmd, cwd } of commands) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📌 ${label}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    runSync(cmd, cwd);
  }
  console.log(`\n✅ 全ステップ完了\n`);
}

/**
 * 複数コマンドを並列 spawn（Dev起動用）
 */
export function runParallel(commands: Command[]): void {
  console.log(`\n🚀 並列起動: ${commands.map((c) => c.label).join(" / ")}\n`);
  console.log("Ctrl+C で全プロセス終了\n");

  const procs = commands.map(({ label, cmd, cwd }) => {
    const [bin, ...args] = cmd.split(" ");
    const proc = spawn(bin, args, {
      stdio: "inherit",
      shell: true,
      cwd: cwd ?? process.cwd(),
    });
    proc.on("error", (err) => console.error(`❌ [${label}] ${err.message}`));
    return proc;
  });

  // Ctrl+C で全子プロセスを終了
  process.on("SIGINT", () => {
    console.log("\n🛑 全プロセスを終了します...");
    procs.forEach((p) => p.kill("SIGTERM"));
    process.exit(0);
  });

  // 全プロセスが終了したら exit
  let exitCount = 0;
  procs.forEach((p) => {
    p.on("exit", () => {
      exitCount++;
      if (exitCount === procs.length) process.exit(0);
    });
  });
}
