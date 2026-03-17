/**
 * YjsServer — HTTP + WebSocket サーバのラッパークラス
 *
 * index.ts からは `new YjsServer(config).start()` だけで起動できる。
 * 内部では DocRegistry, Connection, Hooks を組み合わせて動作する。
 */
import { createServer, type Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { createDocRegistry } from "./doc-registry.js";
import { setupWSConnection } from "./connection.js";
import type { YjsServerConfig, DocRegistry } from "./types.js";

export class YjsServer {
  private readonly config: Required<
    Pick<YjsServerConfig, "host" | "port" | "pingTimeout">
  > &
    YjsServerConfig;

  private httpServer: Server | null = null;
  private wss: WebSocketServer | null = null;

  readonly registry: DocRegistry;

  constructor(config: YjsServerConfig = {}) {
    this.config = {
      host: config.host ?? "0.0.0.0",
      port: config.port ?? 1234,
      pingTimeout: config.pingTimeout ?? 30_000,
      ...config,
    };

    this.registry = createDocRegistry();
    if (this.config.persistence) {
      this.registry.setPersistence(this.config.persistence);
    }
  }

  async start(): Promise<void> {
    const { host, port, hooks, pingTimeout } = this.config;

    this.httpServer = createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", docs: this.registry.listDocs() }));
    });

    this.wss = new WebSocketServer({ noServer: true });

    this.httpServer.on("upgrade", (req, socket, head) => {
      const handleAuth = async () => {
        if (hooks?.authCheck) {
          const result = await hooks.authCheck(req);
          if (!result.ok) {
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            console.log(
              `[yjs:auth-rejected] reason="${result.reason ?? "unknown"}"`,
            );
            return;
          }
        }

        this.wss!.handleUpgrade(req, socket, head, (ws: WebSocket) => {
          this.wss!.emit("connection", ws, req);
        });
      };

      void handleAuth();
    });

    this.wss.on("connection", (conn: WebSocket, req) => {
      const docName = extractDocName(req.url);
      void setupWSConnection(conn, docName, {
        registry: this.registry,
        hooks,
        pingTimeout,
      });
    });

    return new Promise<void>((resolve) => {
      this.httpServer!.listen(port, host, () => {
        console.log(`[yjs-server] running at ${host}:${port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    // 全 Y.Doc を永続化してから停止
    const docs = this.registry.listDocs();
    for (const { docName } of docs) {
      await this.registry.destroyDoc(docName);
    }

    return new Promise<void>((resolve, reject) => {
      if (this.wss) this.wss.close();
      if (this.httpServer) {
        this.httpServer.close((err) => (err ? reject(err) : resolve()));
      } else {
        resolve();
      }
    });
  }
}

function extractDocName(url: string | undefined): string {
  if (!url) return "default";
  const parts = url.slice(1).split("?");
  return decodeURIComponent(parts[0]) || "default";
}
