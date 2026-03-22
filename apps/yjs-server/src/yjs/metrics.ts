import { createServer } from "node:http";
import { Registry, collectDefaultMetrics } from "prom-client";

const register = new Registry();
collectDefaultMetrics({ register });

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
