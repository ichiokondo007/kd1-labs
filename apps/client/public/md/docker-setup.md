# Docker Compose によるローカル開発環境

## サービス構成

```yaml
services:
  mongodb:    # データベース
  minio:      # オブジェクトストレージ (S3互換)
  api:        # Express API サーバ
```

## 起動方法

```bash
# 全サービス起動
docker compose -f docker-compose.app.yml up -d

# ログ確認
docker compose -f docker-compose.app.yml logs -f api

# 停止
docker compose -f docker-compose.app.yml down
```

## MinIO (オブジェクトストレージ)

- Console: http://localhost:9001
- API Endpoint: http://localhost:9000
- Canvas サムネイルや画像アセットの保存に使用

## 環境変数

| 変数 | 説明 | デフォルト |
|---|---|---|
| `MONGODB_URI` | MongoDB 接続文字列 | `mongodb://localhost:27017` |
| `MINIO_ENDPOINT` | MinIO エンドポイント | `localhost:9000` |
| `VITE_API_BASE_URL` | フロント → API | `""` (proxy経由) |
