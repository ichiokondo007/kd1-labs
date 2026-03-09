---
name: Canvas thumbnail generation
overview: Canvas Save 時にクライアント側で fabric.js の toDataURL() を使ってサムネイル（JPEG 480x288）を生成し、既存の uploadFile() でアップロード後、thumbnailUrl 付きでサーバに保存する。DB/一覧表示は既に thumbnailUrl 対応済みのため、中間層の穴を埋める変更のみ。
todos:
  - id: fabric-toDataURL
    content: FabricCanvasHandle に toDataURL メソッドを追加（JPEG 480x288 リサイズ）
    status: completed
  - id: canvasApi-thumbnailUrl
    content: saveCanvas() に thumbnailUrl 引数を追加し POST body に含める
    status: completed
  - id: editor-handleSave
    content: handleSave でサムネイル生成 → アップロード → URL 付きで保存
    status: completed
  - id: server-port-usecase
    content: サーバ port/usecase/controller に thumbnailUrl を追加
    status: completed
  - id: server-adapter
    content: "Adapter の thumbnailUrl: null ハードコードを data.thumbnailUrl ?? null に変更"
    status: completed
isProject: false
---

# Canvas サムネイル生成プラン

## 現状

- DB スキーマ・共有型・一覧ページは既に `thumbnailUrl` フィールドを持っている
- しかし Adapter 層で `thumbnailUrl: null` がハードコードされており、保存フローの中間層で値が途切れている
- `FabricCanvasHandle` に `toDataURL` メソッドがない

## データフロー（変更後）

```mermaid
sequenceDiagram
    participant Editor as CanvasEditorPage
    participant Fabric as FabricCanvas
    participant Storage as uploadFile
    participant API as saveCanvas
    participant Server as POST /api/canvas
    participant DB as MongoDB

    Editor->>Fabric: toDataURL(jpeg, 480x288)
    Fabric-->>Editor: data:image/jpeg;base64,...
    Editor->>Storage: uploadFile(dataUrl, "image/jpeg")
    Storage-->>Editor: thumbnailUrl
    Editor->>API: saveCanvas(name, json, id, thumbnailUrl)
    API->>Server: POST { id, canvasName, canvas, thumbnailUrl }
    Server->>DB: upsert with thumbnailUrl
```



## 変更ファイル一覧

### Client（3 ファイル）

**1. [FabricCanvas.tsx](apps/client/src/features/canvas/ui/FabricCanvas.tsx)**

- `FabricCanvasHandle` に `toDataURL` メソッドを追加
- 内部の `canvasInstanceRef` を使い、指定サイズにリサイズした JPEG dataURL を返す
- fabric.js の `canvas.toDataURL({ format: 'jpeg', quality: 0.8, multiplier })` を利用
- `multiplier` は `480 / canvasWidth` で算出（アスペクト比維持）

**2. [canvasApi.ts](apps/client/src/features/canvas/services/canvasApi.ts)**

- `saveCanvas()` の引数に `thumbnailUrl?: string` を追加
- POST body に `thumbnailUrl` を含める

**3. [canvas-editor.tsx](apps/client/src/pages/example/canvas-editor.tsx)**

- `handleSave` 内で:
  1. `fabricRef.current.toDataURL()` でサムネイル dataURL を取得
  2. `uploadFile(dataUrl, "image/jpeg")` でアップロードし URL を取得
  3. `saveCanvas(canvasName, canvasJson, id, thumbnailUrl)` に URL を渡す

### Server（3 ファイル）

**4. [canvas.port.ts](apps/server/src/ports/canvas.port.ts)**

- `UpsertCanvasInput` に `thumbnailUrl?: string | null` を追加

**5. [upsert-canvas.usecase.ts](apps/server/src/usecases/upsert-canvas.usecase.ts)**

- `UpsertCanvasUsecaseInput` に `thumbnailUrl?: string | null` を追加
- `port.upsertCanvas()` 呼び出し時に `thumbnailUrl` を渡す

**6. [canvas.controller.ts](apps/server/src/controllers/canvas.controller.ts)**

- `req.body` から `thumbnailUrl` を抽出
- `upsertCanvasUsecase()` に渡す

**7. [canvas.documentdb.ts](apps/server/src/adapters/canvas.documentdb.ts)**

- `thumbnailUrl: null` のハードコードを `data.thumbnailUrl ?? null` に変更

## サムネイル仕様

- フォーマット: JPEG（quality: 0.8）
- サイズ: 480x288px（一覧表示の最大 160x96 の 3x、Retina 対応で十分）
- 生成方法: fabric.js の `toDataURL()` + `multiplier` でリサイズ
- アップロード先: 既存の `POST /api/storage/upload`（MinIO）

## 注意点

- サムネイル生成・アップロードに失敗しても Canvas 保存自体は成功させる（`thumbnailUrl` は optional）
- 一覧ページは変更不要（既に `item.thumbnailUrl ?? NOIMAGE_URL` で処理済み）
- DB スキーマ・Repository は変更不要（既に `thumbnailUrl` を受け取れる）

