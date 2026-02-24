/**
 * DB 接続設定（本番・ステージング・開発を環境変数と NODE_ENV で切り替え）
 */
import type { PoolOptions } from "mysql2/promise";

export type DbConfig = PoolOptions;

const ENV = process.env.NODE_ENV ?? "development";

const POOL_BY_ENV = {
  development: {
    connectionLimit: 5,
    waitForConnections: true,
    queueLimit: 0,
  },
  staging: {
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  },
  production: {
    connectionLimit: 20,
    waitForConnections: true,
    queueLimit: 0,
  },
} as const;

const poolOptions =
  ENV === "production"
    ? POOL_BY_ENV.production
    : ENV === "staging"
      ? POOL_BY_ENV.staging
      : POOL_BY_ENV.development;

/**
 * 本番では必須の環境変数が未設定なら throw する
 */
function requireInProduction(name: string, value: string | undefined): void {
  if (ENV === "production" && (value === undefined || value === "")) {
    throw new Error(`[db-client] ${name} is required in production.`);
  }
}

/**
 * 環境変数と NODE_ENV から DB 接続設定を組み立てる。
 * 値は process.env を参照（.env の読み込みは利用側の apps/server 等で行う）
 */
export function getDbConfig(): DbConfig {
  requireInProduction("DB_HOST", process.env.DB_HOST);
  requireInProduction("DB_USER", process.env.DB_USER);
  requireInProduction("DB_PASSWORD", process.env.DB_PASSWORD);
  requireInProduction("DB_NAME", process.env.DB_NAME);

  return {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3307),
    user: process.env.DB_USER ?? "kd1",
    password: process.env.DB_PASSWORD ?? "kd1",
    database: process.env.DB_NAME ?? "kd1",
    ...poolOptions,
  };
}
