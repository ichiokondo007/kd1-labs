# 環境変数・ポート対応表

## サービス別ポートマッピング

| サービス | コンテナ内ポート | ホスト公開ポート | 制御する変数 | 定義ファイル |
|---|---|---|---|---|
| MySQL | 3306 (固定) | `MYSQL_PORT` (既定 3307) | `.env.local` / `.env.docker` | `docker-compose.yml` L16 |
| MongoDB | 27017 (固定) | `MONGO_HOST_PORT` (既定 27017) | `.env.local` / `.env.docker` | `docker-compose.yml` L45 |
| MinIO API | 9000 (固定) | `MINIO_API_PORT` (既定 9000) | `.env.local` / `.env.docker` | `docker-compose.yml` L62 |
| MinIO Console | 9001 (固定) | `MINIO_CONSOLE_PORT` (既定 9001) | `.env.local` / `.env.docker` | `docker-compose.yml` L63 |
| Server (Express) | 3000 | `PORT` (既定 3000) | `.env.docker` | `docker-compose.app.yml` L31 |
| YJS Server | 1234 (固定) | ホスト非公開 (nginx 経由) | - | `docker-compose.app.yml` |
| YJS Metrics | 9091 | 9091 (固定) | - | `docker-compose.app.yml` L58 |
| Client (nginx) | 80 (固定) | `LOCALPOST` (既定 80) | `.env.docker` | `docker-compose.app.yml` L72 |
| Grafana | 3000 (固定) | 3001 (ハードコード) | - | `docker-compose.yml` L142 |
| Prometheus | 9090 (固定) | 9090 (ハードコード) | - | `docker-compose.yml` L127 |
| cAdvisor | 8080 (固定) | 8080 (ハードコード) | - | `docker-compose.yml` L115 |

## ブラウザ向け URL に影響する変数

| 用途 | 仕組み | 組み立て結果 | 定義ファイル |
|---|---|---|---|
| 背景画像 URL | nginx リバースプロキシ（相対パス） | `/storage/public/xxx.jpg` → `minio:9000` | `docker/nginx/default.conf` |
| Grafana | nginx リバースプロキシ（相対パス） | `/grafana/` → `grafana:3000` | `docker/nginx/default.conf` |
| API ベース URL | `VITE_API_BASE_URL` | axios の baseURL (Vite ビルド時埋め込み) | `apps/client/src/services/apiClient.ts` |

## Docker 内ネットワーク（コンテナ間通信）

コンテナ間はサービス名で接続する。`localhost` は使わない。

| 接続元 → 接続先 | ホスト名 | ポート |
|---|---|---|
| server → MySQL | `mysql` | 3306 |
| server → MongoDB | `mongodb` | 27017 |
| server → MinIO | `minio` | 9000 |
| yjs-server → MongoDB | `mongodb` | 27017 |
| nginx → server | `server` | 3000 |
| nginx → yjs-server | `yjs-server` | 1234 |
| nginx → grafana | `grafana` | 3000 |
| nginx → minio | `minio` | 9000 |
| prometheus → cadvisor | `cadvisor` | 8080 |
| prometheus → yjs-server | `kd1-yjs-server` | 9091 |

## 環境別の環境変数読み込み経路

### ローカル開発（pnpm dev）

- **server**: `import "dotenv/config"` → `apps/server/.env` を探す → 存在しない → フォールバック値（localhost）
- **yjs-server**: dotenv なし → フォールバック値（localhost）
- **client**: Vite 内蔵 → `apps/client/.env*` を探す → 存在しない → フォールバック値
- インフラは Docker ポートフォワード経由で `localhost:{ホスト公開ポート}` で接続

### FullDocker

- `docker compose --env-file .env.docker` で読み込み
- `docker-compose.app.yml` の `environment:` でコンテナに注入
- コンテナ内の `process.env` にサービス名（`mysql`, `mongodb` 等）が入る
- コード内の `?? "localhost"` フォールバックは使われない

## 外部サーバで起動する場合

画像 URL は Nginx リバースプロキシ経由の相対パス（`/storage/...`）で返すため、
環境変数の変更は不要。コンテナ間通信はサービス名で固定。
