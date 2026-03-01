# 😎Introduction

> **Proof of concept for evaluating CRDT libraries in Fabric.js applications**
>
> 「Fabric.js」 アプリのための CRDT ライブラリ評価用 POC
> 　１．websockeServerのCRDTオブジェクト、メトリクス確認
> 　２．websocketServerの水平スケール実現検討 ※consistens hash方式でのバランシング
> 　３．自動保存実現方式検討
>
> CRDT libraries
>  ・YJS　CRDTライブラリ
>     → y.websocket + Redis pubsub スケーリング
>     → yhub ライブラリ(未検証)
>
>  ・Loro CRDTライブラリ(未検証)

---

## 🚀 Overview

1. Tech stack

- aaaa

2. Infra

3. package

  ```shell
  kd1-labs
    ├── apps            :アプリケーション
    │   ├── client           : front(react)
    │   └── server           : httpserver
    │   └── yjsserver        : yjs-websocketserver
    │   └── yjsscaleProxy    : yjs-scale-router
    │   └── autoserve-worker : autosave processServer
    ├── packages        : 共通パッケージ
    │   ├── db-client        :drizzle orm(mysql)
    │   ├── db-schema        :drizzle schema(ddl,dml)
    │   ├── storage          :storege操作(S3互換用-MinIO)
    │   └── types　　        :共通型定義
    ├── docker-compose.yml
    ├── env.example    : docer用envファイル
    ├── docker
    │   ├── mongodb    :fablic.jsオブジェクト格納用
    │   ├── mysql      :loginUser管理
    │   └── redis      :CRDTテンポラリテーブル（キャッシュ用）
    ├── package.json
    ├── pnpm-lock.yaml
    └── pnpm-workspace.yaml
    ```

---

## ⌨️ Local installation

1. Prerequisites
  - pnpmインストール済
  - dockerインストール済
2. procedure
  1. packageのrootから pnpm install
  2. Docker-compose起動
  3. Seed実行（DrizzleでのMYSQLセットアップ＆管理者用のユーザレコード登録）
  4. [http://localhost:5173](http://localhost:5173) でログイン
    - UserName: admin
    - Password: password

```shell
# rootから
pnpm install
pnpm -r run build
docker compose up -d
pnpm --filter @kd1-labs/db-client run db:migrate
```

---

## User management 実装手順（本番 API）

クライアントはすでに `GET /api/users/items` を呼び、`{ data: UsersItem[] }` を期待している。  
サーバー側を **下から上**（DB → ルート）の順で実装する。

### 1. packages/db-client（データ取得）

- **目的**: 一覧用にユーザー行を取得する窓口を用意する（`password_hash` は返さない）。
- **作業**:
  - `packages/db-client/src/repositories/users.repository.ts` に `listUsers()` を追加する。
  - 返却型は `{ userId, userName, screenName, isAdmin, avatarUrl }[]` など、一覧表示に必要な項目だけにする。
- **参照**: 既存の `findUserById` / `findUserByUserName` と同じリポジトリに追加。

### 2. apps/server の Port（抽象）

- **目的**: ユースケースが DB に直接依存しないようにする。
- **作業**:
  - `apps/server/src/ports/users.port.ts` を新規作成する。
  - 一覧取得用のインターフェースを定義する（例: `listUsers(): Promise<ListUserItem[]>`）。
  - `ListUserItem` は `userId, userName, screenName, isAdmin, avatarUrl` など、レスポンスに必要な型だけ定義する。

### 3. apps/server の Adapter（Port の実装）

- **目的**: Port を db-client で実装する。
- **作業**:
  - `apps/server/src/adapters/users.drizzle.ts` を新規作成する。
  - 上記 Port を実装し、内部で `db-client` の `listUsers()` を呼ぶ。

### 4. apps/server の Usecase（ビジネスロジック）

- **目的**: 「一覧取得」のユースケースを Express 非依存で定義する。
- **作業**:
  - `apps/server/src/usecases/list-users.usecase.ts` を新規作成する。
  - Port を引数に取るファクトリ（`makeListUsersUsecase(port)`）で、`listUsers()` を呼び、必要なら `isAdmin` → `role`（例: `"Admin"` / `"Viewer"`）の変換を行う。
  - 戻り値はクライアントの `UsersItem` に合わせた形（`id` = `userId`, `role` など）にすると controller が楽になる。

### 5. apps/server の Composition（DI）

- **目的**: Usecase に Adapter を注入する。
- **作業**:
  - `apps/server/src/composition/users.composition.ts` を新規作成する。
  - `listUsersUsecase` を Port 実装（users.drizzle adapter）で生成して export する。

### 6. apps/server の Controller

- **目的**: 認可と HTTP の入出力だけを担当する。
- **作業**:
  - `apps/server/src/controllers/users.controller.ts` を新規作成する。
  - `GET /api/users/items` 用のハンドラを実装する。
  - セッションを確認し、**管理者（isAdmin）のみ** 許可する。未認証なら 401、非管理者なら 403。
  - usecase の戻り値を `{ data: [...] }` の形で返す（クライアントの `usersApi.ts` の想定に合わせる）。
  - JSDoc で `@route GET /api/users/items` と戻り値・status を記載する。

### 7. apps/server の Route と index

- **目的**: URL と controller を結び、アプリにマウントする。
- **作業**:
  - `apps/server/src/routes/users.routes.ts` を新規作成する。
  - `GET /users/items` を上記 controller に紐づける。
  - `apps/server/src/index.ts` で `usersRoutes` を `app.use("/api", usersRoutes)` でマウントする。

### 8. クライアント側

- **作業**: なし（既に `GET /api/users/items` を呼び、`UsersItem[]` として表示している）。
- **確認**: 管理者でログインし、「User management」を開いて一覧が表示され、未ログイン or 非管理者では 401/403 になることを確認する。

### 依存関係の流れ（まとめ）

```
index.ts
  → routes/users.routes.ts
      → controllers/users.controller.ts（認可・HTTP）
          → usecases/list-users.usecase.ts
              → ports/users.port.ts
                  → adapters/users.drizzle.ts
                      → @kd1-labs/db-client listUsers()
```

まずは **1. db-client の `listUsers()`** から実装し、その後に Port → Adapter → Usecase → Composition → Controller → Route → index の順で進めるとよい。

---

## ストレージ（S3 / MinIO）と画像表示

一般的な S3 利用と同様に、**アップロード後に取得した URL をそのまま API で返し、`<img src="...">` で表示**するだけです。

- **必要なこと**: オブジェクトが読み取り可能であること（公開バケット or 署名付き URL）。本番で S3 を使う場合も、バケットの公開設定や CloudFront 等の URL を返すだけです。
- **MinIO で 403 Forbidden になる場合**: public バケットの匿名読み取りが有効になっていません。以下で minio-init を再実行し、`mc anonymous set download local/public` を適用してください。
  ```bash
  docker compose run --rm minio-init
  ```
- **CORS**: `<img>` で表示するだけなら多くの環境で不要です。MinIO で画像が表示されない場合のみ、`docker/minio/cors.xml` と `minio-init` の `mc cors set` を利用してください（任意）。
- **本番・3000 以外**: ポートに依存しません。アップロード時に `MINIO_PUBLIC_URL_BASE`（または S3 のベース URL）で「クライアントが参照する URL」を決め、その URL が DB に保存されます。本番ではその環境のストレージ URL（例: `https://your-bucket.s3.amazonaws.com/` や CloudFront のドメイン）を指定すればよいです。

---

## cursor settings

- Contextエンジニアリング設定

  ```markdown

  AGENTS.md             ← kd1憲法
  apps/client/AGENTS.md ← 固有React特化憲法
  apps/server/AGENTS.md ← 固有Express特化憲法（クリーンアーキテクチャパターン）
  .cursor/skills/       ← 固有手順書(業務設計書)
  Vercel Skills

  ```

---

## docker

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

