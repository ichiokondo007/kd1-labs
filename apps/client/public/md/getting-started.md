# Getting Started with KD1 Labs

## Overview

KD1 Labs は Fabric.js Canvas アプリケーションの共同編集 POC プロジェクトです。

## 開発環境セットアップ

### 前提条件

- Node.js 20+
- pnpm 10+
- Docker & Docker Compose

### 起動手順

```bash
# 依存パッケージインストール
pnpm install

# Docker サービス起動（MongoDB, MinIO）
docker compose -f docker-compose.app.yml up -d

# 開発サーバ起動
pnpm dev
```

## プロジェクト構成

| ディレクトリ | 役割 |
|---|---|
| `apps/client` | React フロントエンド |
| `apps/api` | Express API サーバ |
| `apps/yjs-server` | Yjs WebSocket サーバ |
| `packages/types` | 共有型定義 |

## 次のステップ

- [Yjs Architecture](yjs-architecture) - 共同編集の設計を理解する
- [Docker Setup](docker-setup) - Docker 環境の詳細
