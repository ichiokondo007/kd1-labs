# 😎Introduction

> **Proof of concept for evaluating CRDT libraries in Fabric.js applications**
>
> 「Fabric.js」 アプリのための CRDT ライブラリ評価用 POC
>  １．websockeServerのCRDTオブジェクト、メトリクス確認
>  ２．websocketServerの水平スケール実現検討 ※consistens hash方式でのバランシング
>  ３．自動保存実現方式検討

---

## ️🚀️環境一覧

| 環境  | 役割             | インフラ                    |
| ----- | ---------------- | --------------------------- |
| local | 個人開発環境     | ローカルPC + docker Compose |
| dev   | ローカル実行環境 | Docker Compose              |
| stage | ステージング環境 | Docker Swarm                |
| prod  | 本番環境         | AWS                         |

---

## 🚀️ Local installation(dev)

### [Prerequisites]

- pnpmインストール済
- dockerインストール済

### [procedure]

- packageのrootから pnpm install
- Docker-compose起動
- Seed実行（DrizzleでのMYSQLセットアップ＆管理者用のユーザレコード登録）
- [http://localhost:5173](http://localhost:5173) でログイン
  - UserName: admin
  - Password: password

### [Command]

```shell
pnpm install
pnpm -r run build
docker compose up -d
pnpm --filter @kd1-labs/db-client run db:migrate
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

## 🚀ストレージ（S3 / MinIO）と画像表示

一般的な S3 利用と同様に、**アップロード後に取得した URL をそのまま API で返し、`<img src="...">` で表示**するだけです。

- **必要なこと**: オブジェクトが読み取り可能であること（公開バケット or 署名付き URL）。本番で S3 を使う場合も、バケットの公開設定や CloudFront 等の URL を返すだけです。
- **MinIO で 403 Forbidden になる場合**: public バケットの匿名読み取りが有効になっていません。以下で minio-init を再実行し、`mc anonymous set download local/public` を適用してください。
  ```bash
  docker compose run --rm minio-init
  ```
- **CORS**: `<img>` で表示するだけなら多くの環境で不要です。MinIO で画像が表示されない場合のみ、`docker/minio/cors.xml` と `minio-init` の `mc cors set` を利用してください（任意）。
- **本番・3000 以外**: ポートに依存しません。アップロード時に `MINIO_PUBLIC_URL_BASE`（または S3 のベース URL）で「クライアントが参照する URL」を決め、その URL が DB に保存されます。本番ではその環境のストレージ URL（例: `https://your-bucket.s3.amazonaws.com/` や CloudFront のドメイン）を指定すればよいです。

---

## 🚀docker

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


