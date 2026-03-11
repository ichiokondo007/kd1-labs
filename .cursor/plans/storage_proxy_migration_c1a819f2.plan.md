---
name: Storage Proxy Migration
overview: MinIO 画像を「キーのみ DB 保存 + サーバプロキシ配信」方式に移行する。環境（ローカル/Docker）に依存しない設計にする。
todos:
  - id: refactor-upload-return-key
    content: storage.minio.ts の upload() を URL ではなくキーを返すように変更
    status: completed
  - id: refactor-proxy-endpoint
    content: GET /api/storage/proxy を ?key= 方式に変更（MINIO_ENDPOINT から fetch URL を動的組み立て）
    status: completed
  - id: refactor-toProxyStorageUrl
    content: toProxyStorageUrl をキーベースに書き換え（API_PUBLIC_BASE 不要に）
    status: completed
  - id: remove-env-minio-public-url
    content: MINIO_PUBLIC_URL_BASE を .env.docker / .env.local / コードから削除
    status: completed
  - id: avatar-proxy
    content: "Step 1 アバター: me / auth / users / canvas-updater の controller で toProxyStorageUrl 適用"
    status: completed
  - id: thumbnail-proxy
    content: "Step 2 サムネイル: canvas 一覧の thumbnailUrl に toProxyStorageUrl 適用"
    status: completed
  - id: svg-proxy
    content: "Step 3 SVG: svglibrary の URL をキーベースに変更し toProxyStorageUrl 適用"
    status: completed
isProject: false
---

# MinIO 画像プロキシ移行（キーベース方式）

## 方針

DB にはストレージキー（パス）のみ保存し、クライアントへの配信はサーバプロキシ経由とする。
`MINIO_PUBLIC_URL_BASE` は廃止し、`MINIO_ENDPOINT` + `MINIO_PORT` に一本化する。

### 変更前後

```
変更前:
  DB: "http://localhost:9000/public/uploads/xxx.jpg"  ← 環境依存
  ブラウザ: MinIO に直接アクセス

変更後:
  DB: "uploads/xxx.jpg"                                ← 環境非依存
  ブラウザ: /api/storage/proxy?key=uploads/xxx.jpg     ← サーバ経由
  サーバ: http://{MINIO_ENDPOINT}:9000/public/uploads/xxx.jpg を fetch
```

---

## 基盤変更（全 Step 共通）

### 1. `storage.minio.ts` — upload() がキーのみ返す

- [apps/server/src/adapters/storage.minio.ts](apps/server/src/adapters/storage.minio.ts)
- `buildPublicUrl` を削除、`upload()` は `key` をそのまま返す
- `MinioStorageAdapterConfig` から `publicUrlBase` を削除

### 2. `storage.controller.ts` — プロキシを `?key=` 方式に

- [apps/server/src/controllers/storage.controller.ts](apps/server/src/controllers/storage.controller.ts)
- `GET /api/storage/proxy?key=uploads/xxx.jpg`
- サーバ内で `http://{MINIO_ENDPOINT}:{MINIO_PORT}/{BUCKET}/{key}` を fetch
- URL ホワイトリストチェックは不要（キーのパスバリデーションのみ）
- `MINIO_PUBLIC_URL_BASE` の参照を削除

### 3. `avatarUrl.ts` → `storageUrl.ts` にリネーム＆書き換え

- [apps/server/src/lib/avatarUrl.ts](apps/server/src/lib/avatarUrl.ts)
- `toProxyStorageUrl(key)` はキーを受け取り `/api/storage/proxy?key={key}` を返す
- `API_PUBLIC_BASE` / `MINIO_BASE` の参照を削除（相対パスで十分）

### 4. env ファイル

- `.env.docker`: `MINIO_PUBLIC_URL_BASE` 行を削除
- `.env.local`: `MINIO_PUBLIC_URL_BASE` 行を削除
- `API_PUBLIC_BASE` も不要（プロキシ URL が相対パスになるため）

### 5. `svglibrary.composition.ts` — buildPublicUrl をキーベースに

- [apps/server/src/composition/svglibrary.composition.ts](apps/server/src/composition/svglibrary.composition.ts)
- `MINIO_BASE` / `MINIO_PUBLIC_URL_BASE` の参照を削除
- `buildPublicUrl` → キーをそのまま返す（URL 組み立て不要）

### 6. `storage.composition.ts` — publicUrlBase を削除

- [apps/server/src/composition/storage.composition.ts](apps/server/src/composition/storage.composition.ts)
- `publicUrlBase: process.env.MINIO_PUBLIC_URL_BASE` の行を削除

---

## Step 1: アバター

controller 層で `toProxyStorageUrl(avatarUrl)` を適用する箇所:

- [apps/server/src/controllers/me.controller.ts](apps/server/src/controllers/me.controller.ts): `getMe()`, `patchMe()`
- [apps/server/src/controllers/auth.controller.ts](apps/server/src/controllers/auth.controller.ts): `postLogin()`
- ユーザー一覧の controller: `avatarUrl` を変換
- Canvas 一覧: `updater.avatarUrl` を変換

テスト: Settings / サイドバー / ユーザー管理 / Canvas 一覧の更新者アバターが表示されること

## Step 2: サムネイル

- Canvas 一覧で `thumbnailUrl` に `toProxyStorageUrl` を適用

テスト: Canvas 一覧でサムネイルが表示されること

## Step 3: SVG アセット

- SVG 一覧で `url` に `toProxyStorageUrl` を適用

テスト: SVG ライブラリ画面で SVG が表示されること

---

## 注意: 背景画像

背景画像は Fabric.js JSON 内に URL が埋め込まれる。
現状動作しており、プロキシ化の影響範囲が大きいため別途検討。

## 前提

- 既存の MinIO volume は削除済み（過去データの URL 不整合を考慮しない）
- `docker/minio/cors.xml` は変更不要（プロキシ経由なのでブラウザから MinIO に直接アクセスしない）
