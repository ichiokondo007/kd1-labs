import { connectMongo } from "@kd1-labs/document-db";
import { YjsServer } from "./yjs/server.js";
import { createMongoPersistence } from "./kd1/persistence.js";
import { createKd1Hooks } from "./kd1/hooks.js";

// ── MongoDB 接続 ────────────────────────────────────────────────────
await connectMongo();
console.log("[yjs-server] MongoDB connected");

// ── YjsServer 起動 ──────────────────────────────────────────────────
const server = new YjsServer({
  host: process.env.HOST ?? "0.0.0.0",
  port: parseInt(process.env.PORT ?? "1234", 10),
  persistence: createMongoPersistence(),
  hooks: createKd1Hooks(),
});

await server.start();
