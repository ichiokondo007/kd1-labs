/**
 * 開発環境起動まわり（full-docker, server/client など）の窓口。
 * full-docker: インフラ起動 → MinIO初期化 → DBマイグレーション → アプリDeploy を担当する。
 */

import { execSync } from "node:child_process";
import { runCommand } from "./command.service.js";
import { log } from "../ui/logger.js";
import { createSpinner } from "../ui/spinner.js";

const PROJECT_ROOT = process.cwd();
const BASE_COMPOSE_FILE = "docker-compose.yml";
const APP_COMPOSE_FILE = "docker-compose.app.yml";
const DOCKER_ENV_FILE = ".env.docker";

/** docker compose の共通引数 */
const baseComposeArgs = [
  "compose",
  "-f",
  BASE_COMPOSE_FILE,
  "--env-file",
  DOCKER_ENV_FILE,
];

/**
 * kd1-mysql コンテナの公開ポートを docker port から動的に取得する。
 * 取得できない場合はデフォルト 3307 を返す。
 */
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
    // 0. pnpm install
    spinner.text = "依存インストール（pnpm install）...";
    await runCommand("pnpm", ["install"], PROJECT_ROOT);

    // 1. インフラ起動（mysql, mongodb, minio）
    spinner.text =
      "インフラ起動（mysql, mongodb, minio）... healthcheck 待機中";
    await runCommand(
      "docker",
      [...baseComposeArgs, "up", "-d", "--wait", "mysql", "mongodb", "minio"],
      PROJECT_ROOT,
    );

    // 2. MinIO 初期バケット作成
    spinner.text = "MinIO 初期バケット作成（minio-init）...";
    await runCommand(
      "docker",
      [...baseComposeArgs, "up", "minio-init"],
      PROJECT_ROOT,
    );

    // 3. Drizzle DBマイグレーション（Seed含む）
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

    // 4. アプリケーション Deploy & run
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
