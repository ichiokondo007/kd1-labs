import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { setupWSConnection, getDocs } from "./doc-manager.js";

const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = parseInt(process.env.PORT ?? "1234", 10);

// ── HTTP サーバ ──────────────────────────────────────────────────────
const server = createServer((_req, res) => {
  // ヘルスチェック & デバッグ用
  const activeDocs = getDocs();
  const status = {
    status: "ok",
    activeDocs: activeDocs.size,
    docs: Array.from(activeDocs.entries()).map(([name, doc]) => ({
      name,
      connections: doc.conns.size,
    })),
  };
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(status, null, 2));
});

// ── WebSocket サーバ ─────────────────────────────────────────────────
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  // TODO: Phase 2 で認証チェックを追加
  // const session = parseCookie(request.headers.cookie);
  // if (!session) { socket.destroy(); return; }

  wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", (conn: WebSocket, req) => {
  setupWSConnection(conn, req);
});

// ── 起動 ─────────────────────────────────────────────────────────────
server.listen(PORT, HOST, () => {
  console.log(`[yjs-server] running at ${HOST}:${PORT}`);
});
