# Yjs 共同編集 実装プラン

## Phase 1: Circle 共同編集 (現在)

### ゴール
2つのブラウザタブで同じ Canvas を開き、Circle の追加・移動・リサイズ・削除がリアルタイムに同期されること。

### 実装ステップ

| Step | 内容 | 状態 |
|------|------|------|
| 1 | `apps/yjs-server` 構築（TypeScript/ESM, y-websocket v1.5.4 ベース再実装） | **完了** |
| 2 | クライアント依存パッケージ追加 (`yjs`, `y-websocket`) | 未着手 |
| 3 | `useYjsConnection` hook（WebsocketProvider 接続・Awareness 管理） | 未着手 |
| 4 | `useYjsCircleSync` hook（Circle の Fabric ↔ Y.Map バインディング） | 未着手 |
| 5 | `/example/canvas-yjs` ページ統合 | 未着手 |

### クライアント側ファイル構成

```
apps/client/src/
├── features/canvas-yjs/
│   ├── types.ts                   # CircleProps, AwarenessState
│   ├── hooks/
│   │   ├── useYjsConnection.ts    # WebsocketProvider 接続管理
│   │   └── useYjsCircleSync.ts    # Fabric ↔ Y.Map バインディング
│   ├── ui/
│   │   ├── YjsCanvas.tsx          # Fabric Canvas + Yjs統合
│   │   └── ConnectedUsers.tsx     # Awareness表示（アバター一覧）
│   └── index.ts
├── pages/example/
│   └── canvas-yjs.tsx             # ページコンポーネント
```

## Phase 2: 永続化 + スケーリング検証

| Step | 内容 |
|------|------|
| 2-1 | MongoDB Persistence 実装 (bindState / writeState) |
| 2-2 | Canvas JSON → Y.Doc 変換、Y.Doc → Canvas JSON 変換 |
| 2-3 | Rect 等の他オブジェクト対応 |
| 2-4 | Docker 化 (Dockerfile.yjs-server, docker-compose 追加) |
| 2-5 | スケーリング方式選定 (y/hub vs Hocuspocus) |
| 2-6 | マルチインスタンス構成構築 |
| 2-7 | 負荷テストクライアント作成 |
| 2-8 | メトリクス収集基盤 (Prometheus + Grafana) |
| 2-9 | ベンチマーク実施 (100Canvas × 10人) |
