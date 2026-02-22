import * as mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@kd1-labs/db-schema";

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3307),
  user: process.env.DB_USER ?? "kd1",
  password: process.env.DB_PASSWORD ?? "kd1",
  database: process.env.DB_NAME ?? "kd1",
  connectionLimit: 10,
});

export const db = drizzle({ client: pool, schema, mode: "default" });
export { schema };
