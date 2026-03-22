import { execSync } from "node:child_process";
import { runCommand, log, createSpinner } from "@kd1-labs/devtool-cli";

const PROJECT_ROOT = process.cwd();
const BASE_COMPOSE_FILE = "docker-compose.yml";
const APP_COMPOSE_FILE = "docker-compose.app.yml";
const DOCKER_ENV_FILE = ".env.docker";

const baseComposeArgs = [
  "compose",
  "-f",
  BASE_COMPOSE_FILE,
  "--env-file",
  DOCKER_ENV_FILE,
];

function getMysqlPort(): string {
  try {
    const out = execSync("docker port kd1-mysql 3306", {
      encoding: "utf-8",
    }).trim();
    const port = out.split("\n")[0]?.split(":").pop();
    if (port && /^\d+$/.test(port)) return port;
  } catch {
    log.warn(
      "⚠ kd1-mysql コンテナからポートを取得できません。デフォルト 3307 を使用します。",
    );
  }
  return "3307";
}

export async function runFullDocker(): Promise<void> {
  const spinner = createSpinner("Full Docker run を準備しています...");

  try {
    spinner.text = "依存インストール（pnpm install）...";
    await runCommand("pnpm", ["install"], PROJECT_ROOT);

    spinner.text =
      "インフラ起動（mysql, mongodb, minio）... healthcheck 待機中";
    await runCommand(
      "docker",
      [...baseComposeArgs, "up", "-d", "--wait", "mysql", "mongodb", "minio"],
      PROJECT_ROOT,
    );

    spinner.text = "MinIO 初期バケット作成（minio-init）...";
    await runCommand(
      "docker",
      [...baseComposeArgs, "up", "minio-init"],
      PROJECT_ROOT,
    );

    spinner.text = "db-client ビルド...";
    await runCommand(
      "pnpm",
      ["--filter", "@kd1-labs/db-client...", "run", "build"],
      PROJECT_ROOT,
    );

    const dbPort = getMysqlPort();
    log.info(`\n🔌 DB_PORT=${dbPort} (kd1-mysql)`);
    spinner.text = "DBマイグレーション実行...";
    await runCommand(
      "pnpm",
      ["--filter", "@kd1-labs/db-client", "run", "db:migrate"],
      { cwd: PROJECT_ROOT, env: { ...process.env, DB_PORT: dbPort } },
    );

    spinner.text = "アプリケーション Deploy（server, client）...";
    await runCommand(
      "docker",
      [
        "compose",
        "-f",
        BASE_COMPOSE_FILE,
        "-f",
        APP_COMPOSE_FILE,
        "--env-file",
        DOCKER_ENV_FILE,
        "up",
        "--build",
        "-d",
      ],
      PROJECT_ROOT,
    );

    spinner.succeed("Full Docker run が完了しました");
  } catch (error) {
    spinner.fail("Full Docker run に失敗しました");

    if (error instanceof Error) {
      log.error(`\n${error.message}`);
    } else {
      log.error("\n不明なエラーが発生しました");
    }
  }
}
