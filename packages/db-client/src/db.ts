import * as mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@kd1-labs/db-schema";
import { getDbConfig } from "./config.js";

export const pool = mysql.createPool(getDbConfig());

export const db = drizzle({ client: pool, schema, mode: "default" });
export { schema };
