/**
 * MongoDB 接続設定（環境変数と NODE_ENV で切り替え）
 */

const ENV = process.env.NODE_ENV ?? "development";

/**
 * 本番では必須の環境変数が未設定なら throw する
 */
function requireInProduction(name: string, value: string | undefined): void {
  if (ENV === "production" && (value === undefined || value === "")) {
    throw new Error(`[document-db] ${name} is required in production.`);
  }
}

/**
 * 環境変数から MongoDB 接続 URI を組み立てる。
 * .env の読み込みは利用側の apps/server 等で行う。
 */
export function getMongoUri(): string {
  requireInProduction("MONGO_HOST", process.env.MONGO_HOST);
  requireInProduction("MONGO_USER", process.env.MONGO_USER);
  requireInProduction("MONGO_PASSWORD", process.env.MONGO_PASSWORD);
  requireInProduction("MONGO_DATABASE", process.env.MONGO_DATABASE);

  const host = process.env.MONGO_HOST ?? "localhost";
  const port = process.env.MONGO_PORT ?? "27017";
  const user = process.env.MONGO_USER ?? "kd1";
  const password = process.env.MONGO_PASSWORD ?? "kd1";
  const database = process.env.MONGO_DATABASE ?? "kd1";

  return `mongodb://${user}:${password}@${host}:${port}/${database}?authSource=admin`;
}
