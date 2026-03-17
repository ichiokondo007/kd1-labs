import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  // server と同様: document-db / mongoose はバンドルせずランタイムで解決（ESM で動的 require を避ける）
  skipNodeModulesBundle: true,
});
