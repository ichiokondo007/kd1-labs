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

---

## ⌨️ Local installation

---

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

---

## cursor settings

- Contextエンジニアリング設定
  ```markdown

  AGENTS.md             ← 憲法
  apps/client/AGENTS.md ← 固有React特化憲法
  apps/server/AGENTS.md ← 固有Express特化憲法（クリーンアーキテクチャパターン）
  .cursor/skills/       ← 固有手順書(業務設計書)
  Vercel Skills

  ```
- MCP
  - serena.mcp
- custome command
  - aaaa

### docker

- すべてroot上のdocker-composeで定義
  - mysql
    - port:
    - volume
  - mongoDB
    - port
    - volume
  - Redis
  -port
  -volume

```bash
//rootから
$ docker compose up -d

[+] up 5/5
 ✔ Container kd1-mongodb
 ✔ Container kd1-minio
 ✔ Container kd1-mysql
 ✔ Container minio-init

//rootから
$ pnpm --filter @kd1-labs/db-client run db:migrate
```

localhost:9001/　：MinIO