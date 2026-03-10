# Feature: canvas-yjs

Yjs CRDT を用いた Canvas 共同編集機能。

## レイヤー責務

- ui/ : Presentational（CollabStatusBadge, ConnectedUsers 等）
- hooks/ : Yjs 接続管理・一覧取得・Fabric↔Y.Map 同期
- services/ : Yjs 固有の API（Phase 1 では既存 canvas/services を再利用）
- domain/ : ステータス判定・ラベル生成等の純関数
- types.ts : CollabStatus, YjsCanvasListItem 等

## 依存

- `features/canvas/services` の fetchCanvasItems / fetchCanvas を再利用
- `components/canvas-list-table` の CanvasListTable を一覧ページで利用

## 禁止

- ui/ から services/ を直接呼ばない
- domain/ で React import しない
