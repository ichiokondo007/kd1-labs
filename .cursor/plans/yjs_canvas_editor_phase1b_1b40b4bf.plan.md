---
name: Yjs canvas editor Phase1b
overview: Canvas Yjs 共同編集エディタページを実装する。既存 canvas-editor.tsx をコピーして canvas-yjs-editor.tsx を作成し、Save/Delete を削除、Yjs 接続 + Fabric 同期 + Awareness を追加する。
todos:
  - id: step2-deps
    content: apps/client に yjs + y-websocket 依存追加
    status: completed
  - id: step3-useYjsConnection
    content: useYjsConnection hook 作成（Y.Doc + WebsocketProvider + Awareness + 接続ステータス）
    status: completed
  - id: step4-fabric-getCanvas
    content: FabricCanvas に getCanvas() メソッド追加
    status: completed
  - id: step4-useYjsCircleSync
    content: useYjsCircleSync hook 作成（Fabric ↔ Y.Map バインディング）
    status: completed
  - id: step5-ui-components
    content: ConnectedUsers + ConnectionStatusBadge UI コンポーネント作成
    status: completed
  - id: step5-editor-page
    content: canvas-yjs-editor.tsx ページ作成（canvas-editor ベース）
    status: completed
  - id: step5-routing
    content: App.tsx ルート更新 + docs ステータス更新
    status: completed
isProject: false
---

# Yjs Canvas 共同編集エディタ Phase 1b 実装

## 前提

- 既存 `canvas-editor.tsx` は「新規作成/単独編集」専用として維持
- Yjs エディタは「既存 Canvas の共同編集」専用（必ず Canvas がある状態から開始）
- Save は不要（Phase 2 で Persistence サーバ側実装）
- A案: コピーして別管理、今後は Yjs 側のみブラッシュアップ

## 実装ステップ

### Step 2: クライアント依存パッケージ追加

`apps/client` に `yjs` と `y-websocket` を追加する。

```bash
pnpm --filter client add yjs y-websocket
```

y-websocket v3 は ESM で `WebsocketProvider` をエクスポート。Vite proxy は設定済み（[vite.config.ts](apps/client/vite.config.ts) L19-23）。

### Step 3: `useYjsConnection` hook

[features/canvas-yjs/hooks/useYjsConnection.ts](apps/client/src/features/canvas-yjs/hooks/useYjsConnection.ts) を新規作成。

責務:

- `Y.Doc` 生成 + `WebsocketProvider` 接続管理
- canvasId を room 名として `ws://<host>/yjs/<canvasId>` に接続
- Awareness にログインユーザ情報（`/api/me` から取得済み）をセット
- 接続ステータス管理（`connected` / `connecting` / `disconnected`）
- `synced` 状態の管理（初期同期完了判定）
- アンマウント時に `provider.destroy()` + `doc.destroy()` でクリーンアップ

返却値:

```typescript
{
  yDoc: Y.Doc;
  provider: WebsocketProvider;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  synced: boolean;
}
```

WebSocket URL の組み立て:

```typescript
const wsUrl = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/yjs`;
```

ローカル開発時は Vite proxy 経由、Docker 時は Nginx proxy 経由（Phase 2 で設定）。

### Step 4: `useYjsCircleSync` hook

[features/canvas-yjs/hooks/useYjsCircleSync.ts](apps/client/src/features/canvas-yjs/hooks/useYjsCircleSync.ts) を新規作成。

責務:

- `yDoc.getMap("circles")` を取得
- Fabric.js イベント (`object:modified`, `object:added`, `object:removed`) を Y.Map に反映
- `yCircles.observe()` でリモート変更を Fabric Canvas に反映
- `isRemoteUpdate` フラグによるループ防止
- Phase 1 は Circle のみ対象（設計書通り）

必要な入力:

- `yDoc: Y.Doc` — useYjsConnection から
- `fabricRef: FabricCanvasHandle` — Canvas インスタンスへのアクセス

FabricCanvas への変更:

- 現在の `FabricCanvasHandle` に **Canvas インスタンスを直接取得する** メソッドが必要。Yjs 同期では `object:modified` 等の Fabric イベントをリッスンする必要があり、`toJSON` / `loadFromJSON` の高レベル API だけでは不十分。
- `getCanvas(): Canvas | null` を `FabricCanvasHandle` に追加する。

```typescript
// FabricCanvas.tsx に追加
getCanvas() {
  return canvasInstanceRef.current;
}
```

### Step 5: エディタページ + UI 統合

**5a. `ConnectedUsers` コンポーネント**

[features/canvas-yjs/ui/ConnectedUsers.tsx](apps/client/src/features/canvas-yjs/ui/ConnectedUsers.tsx) を新規作成。

- Awareness states から接続中ユーザのアバター一覧を表示
- 既存の `UserAvatar` コンポーネントを再利用

**5b. `ConnectionStatusBadge` コンポーネント**

[features/canvas-yjs/ui/ConnectionStatusBadge.tsx](apps/client/src/features/canvas-yjs/ui/ConnectionStatusBadge.tsx) を新規作成。

- WebSocket 接続状態（connected / connecting / disconnected）をバッジ表示
- 既存 `Badge` コンポーネントを再利用

**5c. `canvas-yjs-editor.tsx` ページ**

[pages/example/canvas-yjs-editor.tsx](apps/client/src/pages/example/canvas-yjs-editor.tsx) を新規作成。

`canvas-editor.tsx` からコピーし、以下を変更:

削除するもの:

- Canvas 名入力 (`Input` + `validateCanvasName`)
- Save / Delete / Cancel ボタンと関連 state/handler
- 成功ダイアログ / 削除確認ダイアログ
- `saveCanvas` / `deleteCanvas` の import

追加するもの:

- `useYjsConnection(canvasId)` — WebSocket 接続
- `useYjsCircleSync(yDoc, fabricRef)` — Fabric 同期
- `ConnectedUsers` — ヘッダーにユーザ一覧表示
- `ConnectionStatusBadge` — 接続状態表示
- 「一覧に戻る」ボタン（`/example/canvas-yjs` へ遷移）

残すもの:

- `FabricCanvas` + `CanvasEditorToolbar`（ツールバー + 図形配置）
- 背景画像（`CanvasBgCropper` + アップロード）
- SVG アセット配置（`SvgAssetsDrawer`）
- REST API による初期 Canvas ロード（`fetchCanvas`）
- ローディング表示

初期ロードフロー:

1. `fetchCanvas(id)` で MongoDB から canvas JSON を取得
2. `fabricRef.current.loadFromJSON(data.canvas)` で Fabric に描画
3. `useYjsConnection` で WebSocket 接続開始
4. `useYjsCircleSync` で Fabric ↔ Y.Map バインディング開始

**5d. ルーティング更新**

[App.tsx](apps/client/src/App.tsx) の `/example/canvas-yjs/:id` を `ComingSoonPage` から `CanvasYjsEditorPage` に変更。

## ファイル変更一覧


| ファイル                                           | 変更                             |
| -------------------------------------------------- | -------------------------------- |
| `apps/client/package.json`                         | `yjs`, `y-websocket` 追加        |
| `features/canvas-yjs/hooks/useYjsConnection.ts`    | 新規                             |
| `features/canvas-yjs/hooks/useYjsCircleSync.ts`    | 新規                             |
| `features/canvas-yjs/hooks/index.ts`               | export 追加                      |
| `features/canvas-yjs/ui/ConnectedUsers.tsx`        | 新規                             |
| `features/canvas-yjs/ui/ConnectionStatusBadge.tsx` | 新規                             |
| `features/canvas-yjs/ui/index.ts`                  | export 追加                      |
| `features/canvas/ui/FabricCanvas.tsx`              | `getCanvas()` 追加               |
| `pages/example/canvas-yjs-editor.tsx`              | 新規（canvas-editor.tsx ベース） |
| `App.tsx`                                          | ルート更新                       |
| `docs/yjs/implementation-plan.md`                  | ステータス更新                   |


