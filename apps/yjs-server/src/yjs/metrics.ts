import { createServer } from "node:http";
import { Registry, collectDefaultMetrics, Gauge } from "prom-client";

const register = new Registry();
collectDefaultMetrics({ register });

// ── カスタムメトリクス ───────────────────────────────────────────────

export const activeDocsGauge = new Gauge({
  name: "yjs_active_docs_total",
  help: "Number of Y.Doc instances currently in memory",
  registers: [register],
});

export const activeConnectionsGauge = new Gauge({
  name: "yjs_active_connections_total",
  help: "Number of active WebSocket connections",
  registers: [register],
});

// ── メトリクス HTTP サーバー ─────────────────────────────────────────

export function startMetricsServer(port = 9091): void {
  const server = createServer(async (_req, res) => {
    res.writeHead(200, { "Content-Type": register.contentType });
    res.end(await register.metrics());
  });
  server.listen(port, () => {
    console.log(`[yjs-server] metrics at :${port}/metrics`);
  });
}

export { register };
