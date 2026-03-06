# Tips: なぜ tsc ではなく tsup を使うのか（ESM + monorepo）

## 背景

本プロジェクトの `apps/server` は TypeScript + ESM (`"type": "module"`) で実装されている。
ローカル開発では `tsx watch` で実行しており問題なく動作していたが、
Docker 上で `tsc` ビルド → `node dist/index.js` で直接実行すると **モジュール解決エラー** が発生した。

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/app/apps/server/dist/routes/auth.routes'
```

---

## 原因: tsc は import パスの拡張子を補完しない

### ソースコード (src/index.ts)

```typescript
import { authRoutes } from "./routes/auth.routes";
```

### tsc の出力 (dist/index.js)

```javascript
import { authRoutes } from "./routes/auth.routes";  // そのまま！ .js が付かない
```

### Node.js ESM の仕様

Node.js の ESM モジュール解決は **拡張子が必須**:

```
./routes/auth.routes     → ERR_MODULE_NOT_FOUND
./routes/auth.routes.js  → OK
```

tsc はトランスパイルのみ行い、import パスの書き換え（拡張子の付与）は行わない。

---

## なぜローカル開発では動いていたか

```json
"dev": "tsx watch src/index.ts"
```

`tsx` は独自のモジュール解決を持っており、拡張子なしでも解決してくれる。
つまり **tsx が補完してくれていたので、問題が隠れていた**。

---

## tsconfig の moduleResolution の違い

| moduleResolution | import の拡張子 | 想定ランタイム                       |
| ---------------- | --------------- | ------------------------------------ |
| `bundler`        | 不要            | Vite, webpack, tsx 等のバンドラー経由 |
| `nodenext`       | **必須** (.js)  | Node.js で直接実行                   |

本プロジェクトの tsconfig:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

`"bundler"` は「バンドラーが解決してくれる前提」の設定。
tsc は拡張子を付けないため、`node dist/index.js` で直接実行すると壊れる。

---

## 解決策の比較

| 方式                            | ソース変更 | 備考                                            |
| ------------------------------- | ---------- | ----------------------------------------------- |
| **tsup (esbuild) でバンドル**   | 不要       | monorepo のデファクト。バンドル済みで node 実行可 |
| moduleResolution を nodenext に | 全 import  | `.js` 拡張子を全ファイルに追加する必要あり       |
| 本番でも tsx を使う             | 不要       | 非推奨。起動速度・メモリのオーバーヘッド         |

本プロジェクトでは **tsup** を採用。理由:

- ソースコードの変更が不要
- Turborepo 公式テンプレートでも採用されているデファクト手法
- esbuild ベースでビルドが高速

---

## 各環境での動作まとめ

| 環境            | 実行方法          | 拡張子解決      | 結果 |
| --------------- | ----------------- | --------------- | ---- |
| ローカル dev    | `tsx` (バンドラー) | tsx が補完      | OK   |
| Docker (tsc)    | `node` (直接)     | 誰もしない      | NG   |
| Docker (tsup)   | `node` (直接)     | tsup がバンドル済 | OK   |

---

## 本プロジェクトの tsup 設定

```typescript
// apps/server/tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  // 全依存を外部化（pnpm deploy で実体コピーされるため）
  skipNodeModulesBundle: true,
});
```

`skipNodeModulesBundle: true` により、npm パッケージもワークスペースパッケージも
バンドルに含めず外部参照とする。実行時の依存解決は `pnpm deploy --prod` で
symlink なしにコピーされた `node_modules` が担う。

---

## 参考

- [tsup 公式ドキュメント](https://tsup.egoist.dev/)
- [Node.js ESM のモジュール解決仕様](https://nodejs.org/api/esm.html#resolution-algorithm)
- [pnpm deploy](https://pnpm.io/cli/deploy) - Docker 向けの依存デプロイ
