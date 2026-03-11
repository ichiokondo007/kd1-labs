import { spawn } from "node:child_process";

export interface CommandResult {
  stdout: string;
  stderr: string;
}

export interface CommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export async function runCommand(
  command: string,
  args: string[],
  cwdOrOpts?: string | CommandOptions,
): Promise<CommandResult> {
  const opts: CommandOptions =
    typeof cwdOrOpts === "string" ? { cwd: cwdOrOpts } : cwdOrOpts ?? {};

  return new Promise<CommandResult>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: opts.cwd,
      env: opts.env,
      stdio: "pipe",
      shell: false,
    });

    const chunks: { out: Buffer[]; err: Buffer[] } = { out: [], err: [] };

    child.stdout.on("data", (data: Buffer) => chunks.out.push(data));
    child.stderr.on("data", (data: Buffer) => chunks.err.push(data));

    child.on("error", reject);

    child.on("close", (code) => {
      const stdout = Buffer.concat(chunks.out).toString().trim();
      const stderr = Buffer.concat(chunks.err).toString().trim();

      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const detail = stderr || stdout;
      const msg = detail
        ? `${command} ${args.join(" ")} failed (code ${code}):\n${detail}`
        : `${command} ${args.join(" ")} failed with code ${code}`;
      reject(new Error(msg));
    });
  });
}
