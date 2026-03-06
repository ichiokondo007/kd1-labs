# 😎Introduction

> **Proof of concept for evaluating CRDT libraries in Fabric.js applications**
>
> 「Fabric.js」 アプリのための CRDT ライブラリ評価用 POC
> １．websockeServerのCRDTオブジェクト、メトリクス確認
> ２．websocketServerの水平スケール実現検討 ※consistent hash方式でのバランシング
> ３．自動保存実現方式検討

---

## ️🚀️環境一覧


| 環境  | 役割             | インフラ                    |
| ----- | ---------------- | --------------------------- |
| local | 個人開発環境     | ローカルPC + docker Compose |
| dev   | ローカル実行環境 | Docker Compose              |
| stage | ステージング環境 | Docker Swarm                |
| prod  | 本番環境         | AWS                         |


---

## 🚀️ Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10.18+
- Docker / Docker Compose

### A. ローカル開発（インフラだけ Docker、アプリはホスト実行）

```shell
# 1. 依存インストール
pnpm install

# 2. 全パッケージビルド
pnpm -r run build

# 3. インフラ起動 (MySQL, MongoDB, MinIO)
docker compose up -d

# 4. DBマイグレーション
pnpm --filter @kd1-labs/db-client run db:migrate

# 5. サーバー起動
pnpm --filter server dev

# 6. クライアント起動（別ターミナル）
pnpm --filter client dev
```

- [http://localhost:5173](http://localhost:5173) でアクセス
  - UserName: admin
  - Password: password

### B. フルDocker起動（全てコンテナで実行）

```shell
# 1. 依存インストール（マイグレーション実行用）
pnpm install

# 2. 全コンテナ起動（イメージのビルド含む）
docker compose -f docker-compose.yml -f docker-compose.app.yml \
  --env-file .env.docker up --build -d

# 3. MySQL の healthcheck 通過を待つ
docker compose -f docker-compose.yml wait mysql

# 4. マイグレーション用にローカルビルド（db-client とその依存のみ）
pnpm --filter @kd1-labs/db-client... run build

# 5. DBマイグレーション（ホストから localhost:3307 経由で接続）
pnpm --filter @kd1-labs/db-client run db:migrate
```

- [http://localhost:8080](http://localhost:8080) でアクセス (nginx)
  - UserName: admin
  - Password: password
- API: [http://localhost:3000](http://localhost:3000)

### フルDocker停止

```shell
docker compose -f docker-compose.yml -f docker-compose.app.yml down
```

---

## 🚀 Overview

1. Tech stack
2. Infra
3. package
  ```shell
    kd1-labs
      ├── apps            :アプリケーション
      │   ├── client           : front(react)
      │   └── server           : httpserver
      │   └── yjs-server        : yjs-websocketserver
      │   └── yjs-scaleProxy    : yjs-scale-router
      │   └── autoserve-worker : autosave processServer
      ├── packages        : 共通パッケージ
      │   ├── db-client        :drizzle orm(mysql)
      │   ├── db-schema        :drizzle schema(ddl,dml)
      │   ├── storage          :storege操作(S3互換用-MinIO)
      │   └── types　　        :共通型定義
      ├── docker-compose.yml
      ├── env.example    : docer用envファイル
      ├── docker        :未使用 柄のみ
      │   ├── mongodb
      │   ├── mysql
      │   └── redis
      ├── package.json
      ├── pnpm-lock.yaml
      └── pnpm-workspace.yaml
  ```

---

## 🚀 docker

- 起動オプション

  | ImageName        | local | dev |
  | ---------------- | ----- | --- |
  | mysql            | ✅     | ✅   |
  | mongo            | ✅     | ✅   |
  | minIO            | ✅     | ✅   |
  | Redis            | ✅     | ✅   |
  | client (react)   |       | ✅   |
  | server( express) |       | ✅   |
  | YJS-websocket    |       | ✅   |

- command
  ```shell

  #🌝 START
   docker compose up -d

   docker ps --format 'table {{.ID}}\t{{.Names}}\t{{.Ports}}'

    CONTAINER ID   NAMES         PORTS
    7b1f93f18c5e   kd1-mongodb   0.0.0.0:27017->27017/tcp, [::]:27017->27017/tcp
    05075a7c695b   kd1-minio     0.0.0.0:9000-9001->9000-9001/tcp, [::]:9000-9001->9000-9001/tcp
    ce3f75990fec   kd1-mysql     33060/tcp, 0.0.0.0:3307->3306/tcp, [::]:3307->3306/tcp

  #🌝 STOP
   docker compose down

  #🌝 Named valuem,image含め削除したい場合（kd1関連をすべて削除)
   docker compose down -v --rmi all
  ```
- 自身のローカルで起動時、portバッティングする際は、rootの「env.exsample」をコピーして自身の環境用に変更してください
  ```yml
  # ============================================================
  # KD1 Docker Compose 環境設定
  # ============================================================
  # 使い方:
  #   1. このファイルを .env にコピー: cp .env.example .env
  #   2. 必要な箇所だけ変更する
  #   3. docker compose up -d で起動
  #
  # ※ .env を作成しなくてもデフォルト値で動作します
  # ============================================================

  # ------------------------------------------------------------
  # MySQL
  # ------------------------------------------------------------
  # MYSQL_VERSION=8.0
  # MYSQL_PORT=3307
  # MYSQL_ROOT_PASSWORD=password
  # MYSQL_DATABASE=kd1
  # MYSQL_USER=kd1
  # MYSQL_PASSWORD=kd1

  # ------------------------------------------------------------
  # MongoDB
  # ------------------------------------------------------------
  # MONGO_VERSION=7.0
  # MONGO_PORT=27017
  # MONGO_USER=kd1
  # MONGO_PASSWORD=kd1
  # MONGO_DATABASE=kd1

  # ------------------------------------------------------------
  # MinIO (S3互換オブジェクトストレージ)
  # ------------------------------------------------------------
  # MINIO_VERSION=latest
  # MINIO_API_PORT=9000
  # MINIO_CONSOLE_PORT=9001
  # MINIO_ROOT_USER=kd1admin
  # MINIO_ROOT_PASSWORD=kd1admin1234
  # MINIO_MC_VERSION=latest
  ```

---

## 🚀 Docker App Build (client / server)

### 設計方針

- `docker-compose.yml` (既存) はインフラのみ (MySQL, MongoDB, MinIO)
- `docker-compose.app.yml` (新規) にアプリ (client, server) を定義
- フルDocker起動時は両ファイルを指定して起動
- client は nginx で静的配信 + `/api` リバースプロキシ
- server は Node.js マルチステージビルド
- 環境切り替えは `.env.local` / `.env.docker` で行う

### ファイル構成

```
kd1-labs/
├── docker-compose.yml          # 既存 (インフラ: MySQL, MongoDB, MinIO)
├── docker-compose.app.yml      # アプリ: client, server
├── .env.local                  # ローカル開発用 (host=localhost)
├── .env.docker                 # Docker用 (host=サービス名)
├── Dockerfile.server           # server マルチステージビルド
├── Dockerfile.client           # client マルチステージビルド → nginx
├── docker/nginx/default.conf   # nginx 設定 (API プロキシ)
```

### 環境変数の切り替え

`.env.local` (ローカル開発) と `.env.docker` (フルDocker) で接続先を切り替える。


| 変数                  | .env.local (ローカル)   | .env.docker (Docker)    |
| --------------------- | ----------------------- | ----------------------- |
| DB_HOST               | localhost               | mysql                   |
| DB_PORT               | 3307                    | 3306                    |
| MONGO_HOST            | localhost               | mongodb                 |
| MINIO_ENDPOINT        | localhost               | minio                   |
| MINIO_PUBLIC_URL_BASE | `http://localhost:9000` | `http://localhost:9000` |


※ `MINIO_PUBLIC_URL_BASE` はブラウザからアクセスするため、Docker時も `localhost` のまま。

### ビルド方式

- **server**: `tsup` (esbuild) でバンドル + `pnpm deploy --prod` で依存を実体コピー (symlink 不要)
- **client**: `vite build` → nginx で静的配信 + `/api` リバースプロキシ

---

## 🚀Vitest(unitTest)について

### 使い方


| コマンド                                 | 説明                                          |
| ---------------------------------------- | --------------------------------------------- |
| `pnpm test`                              | 全 workspace で vitest を watch 実行          |
| `pnpm test:run`                          | 全 workspace で 1 回だけテスト実行（CI 向け） |
| `pnpm --filter client test`              | client だけテスト                             |
| `pnpm --filter @kd1-labs/utils test:run` | utils だけ 1 回実行                           |

テストファイルは `src/**/*.test.{ts,tsx}` または `src/**/*.spec.{ts,tsx}` に置くと検知されます。まだテストがなくても `passWithNoTests: true` で `pnpm test:run` は成功します。

---

## 🚀メトリクス取得設計

| コンポーネント  | 役割                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------- |
| cAdvisor        | Dockerコンテナの外側から、各コンテナのCPU・メモリ・ネットワーク利用率を自動収集します。       |
| Prometheus      | cAdvisorやアプリから送られるメトリクスを保存する時系列データベースです。                      |
| Grafana         | Prometheusのデータをグラフ化・可視化します。                                                  |
| App (WebSocket) | アプリ内部にライブラリ（prom-clientなど）を入れ、接続数などのカスタムメトリクスを公開します。 |

## その他

| ファイル                     | 内容                                          |
| ---------------------------- | --------------------------------------------- |
| `Dockerfile.server`          | server マルチステージビルド (**pnpm deploy**) |
| `Dockerfile.client`          | client マルチステージビルド (**nginx**)       |
| `docker-compose.app.yml`     | アプリサービス定義 (server, client)           |
| `docker/nginx/default.conf`  | nginx SPA配信 + API プロキシ                  |
| `.env.local`                 | ローカル開発用環境変数                        |
| `.env.docker`                | Docker用環境変数                              |
| `.npmrc`                     | `inject-workspace-packages=true`              |
| `apps/server/tsup.config.ts` | **tsup** ビルド設定                           |
| `docs/tips-tsup-esm.md`      | tsup/ESM の解説ドキュメント                   |

### 📝 変更

| ファイル                   | 変更内容                                                |
| -------------------------- | ------------------------------------------------------- |
| `apps/server/package.json` | build を `tsc` → `tsup` に変更、`tsup` 追加             |
| `docker-compose.yml`       | `kd1-network` ネットワーク追加                          |
| `.gitignore`               | `.env.local` / `.env.docker` を除外解除                 |
| `README.md`                | Getting Started (A/B) + Docker App Build セクション追記 |