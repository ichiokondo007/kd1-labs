# Yjs 共同編集アーキテクチャ設計

## プロジェクト目的

FabricJs Canvas アプリケーションの共同編集 POC。
最終目標: YJS CRDT で **100Canvas × 10人/Canvas** のスケーリング検証・サーバメトリクス取得。

## バージョン選定

| パッケージ | バージョン | 役割 |
|-----------|-----------|------|
| `yjs` | `^13.6.24` (stable) | CRDT エンジン |
| `y-websocket` | `3.0.0` | クライアント WebsocketProvider |
| `y-protocols` | `^1.0.6` | Sync/Awareness プロトコル |
| `ws` | `^8.18.0` | サーバ側 WebSocket |
| `lib0` | `^0.2.102` | バイナリ encoding/decoding |

**選定理由**: yjs v14 (pre-release) + `@y/websocket-server` は不安定なため、
yjs v13 (stable) をベースに `y-websocket v1.5.4` の `bin/utils.js` ロジックを
TypeScript/ESM で再実装する方式を採用。

## 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│              kd1-y-websocket (カスタムサーバ)                │
│              apps/yjs-server (port 1234)                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  DocManager (Y.Doc シングルトン管理)                    │  │
│  │                                                       │  │
│  │  docs: Map<canvasId, WSSharedDoc>                     │  │
│  │                                                       │  │
│  │  WSSharedDoc = Y.Doc + {                              │  │
│  │    name: string (= canvasId),                         │  │
│  │    conns: Map<WebSocket, Set<clientId>>,               │  │
│  │    awareness: Awareness,                              │  │
│  │  }                                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Lifecycle Events (ログ出力、Phase 2 で EventEmitter)  │  │
│  │                                                       │  │
│  │  [doc:loaded]   初回ロード時                           │  │
│  │  [doc:idle]     全員退出 → メモリ解放                  │  │
│  │  [user:joined]  ユーザ参加                             │  │
│  │  [user:left]    ユーザ退出                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Persistence (Phase 2)                                │  │
│  │                                                       │  │
│  │  bindState:  MongoDB canvas JSON → Y.Doc 変換          │  │
│  │  writeState: Y.Doc → canvas JSON → MongoDB UPDATE      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  HTTP Health Check                                    │  │
│  │  GET / → { status, activeDocs, docs[] }               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         ▲ ws upgrade                          ▲ ws upgrade
         │ path = /<canvasId>                  │
    Browser A                             Browser B
    WebsocketProvider                     WebsocketProvider
    Y.Doc (circles Y.Map)                 Y.Doc (circles Y.Map)
    Fabric.js Canvas                      Fabric.js Canvas
    Awareness (user info)                 Awareness (user info)
```

## Y.Doc シングルトン保証

`doc-manager.ts` の `getYDoc()` が Map ベースのシングルトンを実装:

```
getYDoc(canvasId):
  docs.has(canvasId) → 既存の Y.Doc を返す
  else → 新規作成 → docs.set → persistence?.bindState → 返す
```

同じ canvasId で接続する全クライアントが同一の Y.Doc インスタンスを共有する。

## 途中参加ライフサイクル

```
t0: User A 接続
    └─ getYDoc("canvas-123") → 新規作成
    └─ SyncStep1 送信 → User A が SyncStep2 で応答
    └─ 既存 awareness states 送信（この時点では空）

t1: User A が Circle を追加/移動
    └─ Fabric event → Y.Map.set(circleId, props)
    └─ Y.Doc update → サーバが全 conns に broadcast

t2: User B が途中参加
    └─ getYDoc("canvas-123") → 既存 doc を返す（シングルトン）
    └─ SyncStep1 送信 → User B は空の state vector
    └─ SyncStep2 でサーバが全差分を返す（User A の操作含む）
    └─ 既存 awareness states 送信（User A の情報）
    └─ User B の Canvas に最新状態が描画される

t3: 全員退出
    └─ conns.size === 0
    └─ Phase 1: doc.destroy() + docs.delete() → メモリ解放
    └─ Phase 2: persistence.writeState() → MongoDB 保存 → destroy
```

## Fabric.js ↔ Yjs バインディング設計

### データモデル

```typescript
// Y.Doc 内の共有データ構造
const yCircles: Y.Map<CircleProps> = yDoc.getMap("circles");

// 各 Circle のプロパティ（plain object として set）
interface CircleProps {
  left: number;
  top: number;
  radius: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  scaleX: number;
  scaleY: number;
  angle: number;
}
```

### 同期フロー

```
Fabric.js (ローカル操作)          Yjs                    Fabric.js (リモート)
──────────────────────          ────                    ─────────────────────
object:modified ─────────→ yCircles.set(id, props)
object:added    ─────────→ yCircles.set(id, props)
object:removed  ─────────→ yCircles.delete(id)
                                    │
                           WebSocket sync
                                    │
                           yCircles.observe() ──→ add: Canvas に追加
                                                  update: プロパティ更新
                                                  delete: Canvas から削除
```

### 同期コントロール

- Yjs は自動バインディングではなく**明示的 API 操作**
- `fabricToYjs()` 関数でどのプロパティを同期するか完全に制御可能
- throttle, debounce, 特定操作のフィルタリングも自由

### ループ防止

```typescript
let isRemoteUpdate = false;

// Fabric → Yjs（ローカル操作時のみ）
canvas.on("object:modified", (e) => {
  if (isRemoteUpdate) return;  // リモート変更の反映中は無視
  yCircles.set(id, fabricToYjs(e.target));
});

// Yjs → Fabric（リモート変更受信時）
yCircles.observe((event) => {
  isRemoteUpdate = true;
  // ... Fabric に反映
  isRemoteUpdate = false;
});
```

## User Presence (Awareness)

Yjs 組み込みの Awareness プロトコルを使用（別 Map 不要）。

```typescript
// 各クライアントが自分の情報を設定
awareness.setLocalState({
  user: {
    userId: "user-123",
    name: "田中太郎",
    avatarUrl: "/avatars/tanaka.jpg",
    avatarColor: "blue-500",
  },
  cursor: { x: 340, y: 210 },  // 後で追加可
});

// 他クライアントの変更を検知
awareness.on("change", () => {
  const states = awareness.getStates();
  // → UI にユーザ一覧を表示
});
```

### フロー
1. クライアント: `GET /api/me` でユーザ情報取得（既存API）
2. `WebsocketProvider` で y-websocket に接続
3. `awareness.setLocalState({ user: { ... } })`
4. 他クライアント: `awareness.on("change")` でユーザ一覧更新

## 認証 (POC)

- Phase 1: 認証省略（接続制限なし）
- Phase 2: `server.on("upgrade")` 時に cookie/session を検証

## スケーリング戦略 (Phase 2)

| 方式 | 概要 | 適合度 |
|------|------|--------|
| **y/hub (旧y-redis)** | Redis Streams + S3/PostgreSQL、公式推奨 | 最有力 |
| Hocuspocus | Redis拡張で水平スケール、高機能 | 候補 |
| カスタムPubSub | y-websocket-server + Redis自作 | 柔軟だが工数大 |
