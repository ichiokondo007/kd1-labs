---
name: canvas-delete-endpoint-and-ui
overview: Canvas物理削除のAPIエンドポイントを追加し、MongoDBから対象Canvasを削除したうえで、クライアントの編集画面から削除処理と一覧画面への遷移を実装する。
todos:
  - id: server-port-adapter-delete
    content: "CanvasPortとcanvasDocumentDbAdapterにdeleteCanvas(id: string): Promise<boolean>を追加する"
    status: completed
  - id: server-delete-usecase
    content: delete-canvas.usecase.tsを作成し、canvas.composition.tsにdeleteCanvasUsecaseを組み込む
    status: completed
  - id: server-delete-controller-route
    content: DELETE /api/canvas/:id エンドポイントのcontrollerとroutesを追加する
    status: completed
  - id: client-delete-service
    content: canvasApi.tsにdeleteCanvasサービス関数を追加する
    status: completed
  - id: client-editor-wire-delete
    content: canvas-editor.tsxからdeleteCanvasを呼び出し、成功時に一覧画面へ遷移するようにする
    status: completed
  - id: delete-feature-testing
    content: DELETEエンドポイントとフロントのCanvas削除フローの動作確認を行う
    status: completed
isProject: false
---

## Canvas削除機能 実装プラン

### 1. サーバー側: ポートとアダプタ拡張（Mongo物理削除）

- **目的**: 既存のPort/Adapter構造に沿って、Canvas物理削除用の抽象と実装を追加する。
- **対応方針**:
  - `[apps/server/src/ports/canvas.port.ts](apps/server/src/ports/canvas.port.ts)` に `deleteCanvas(id: string): Promise<boolean>` を追加する。
    - 返却値 `boolean` は「削除件数 > 0」を表し、存在しないIDの場合は `false` を返す前提とする。
  - `[apps/server/src/adapters/canvas.documentdb.ts](apps/server/src/adapters/canvas.documentdb.ts)` で `@kd1-labs/document-db` から `deleteCanvas` を import し、`CanvasPort` の新メソッドとして実装する。
    - すでに `[packages/document-db/src/repositories/canvas.repository.ts](packages/document-db/src/repositories/canvas.repository.ts)` に `deleteCanvas(id: string): Promise<boolean>` が存在するので、それを呼び出すだけの薄い実装にする。

### 2. サーバー側: Usecase追加とDI

- **目的**: HTTPに依存しない削除ユースケースを定義し、ビジネスルール（ID必須・存在チェック）を集約する。
- **対応方針**:
  - `[apps/server/src/usecases/delete-canvas.usecase.ts](apps/server/src/usecases/delete-canvas.usecase.ts)` を新規作成。
    - `CanvasPort` を受け取り `makeDeleteCanvasUsecase(port)` をエクスポートするファクトリ関数にする。
    - 戻り値型例:
      - 成功: `{ ok: true }`
      - 失敗: `{ ok: false; code: "VALIDATION_ERROR" | "NOT_FOUND"; message: string }`
    - ロジック:
      - `id` が空なら `VALIDATION_ERROR` を返す。
      - `port.deleteCanvas(id)` 実行結果が `false` の場合は `NOT_FOUND` を返す。
      - `true` の場合のみ `{ ok: true }` を返す。
  - `[apps/server/src/composition/canvas.composition.ts](apps/server/src/composition/canvas.composition.ts)` にて:
    - `makeDeleteCanvasUsecase` をimportし、`export const deleteCanvasUsecase = makeDeleteCanvasUsecase(canvasDocumentDbAdapter);` を追加する。

### 3. サーバー側: Controller・Route追加

- **目的**: HTTP DELETEエンドポイント `/api/canvas/:id` を定義し、既存の認証・エラーレスポンス方針に沿って実装する。
- **対応方針**:
  - `[apps/server/src/controllers/canvas.controller.ts](apps/server/src/controllers/canvas.controller.ts)` に `deleteCanvas` コントローラを追加。
    - JSDocでルート定義:
      - `@route DELETE /api/canvas/:id`
      - `@returns 204` 成功（レスポンスボディなし）
      - `@returns 401` 未ログイン
      - `@returns 404` 存在しない
    - 実装:
      - 既存の `postCanvas` / `getCanvas` と同様に `req.session.userInfo` を取得し、未ログイン時は `401 { error: { code: "UNAUTHORIZED", message: "Unauthorized" } }` を返す。
      - `req.params.id` からIDを取得し、`deleteCanvasUsecase(id)` を呼ぶ。
      - `usecase` の結果に応じてステータスを決定:
        - `VALIDATION_ERROR` → `400` + `{ error: { code, message } }`
        - `NOT_FOUND` → `404` + `{ error: { code, message } }`
        - 成功 → `204`（ボディなし）。
  - `[apps/server/src/routes/canvas.routes.ts](apps/server/src/routes/canvas.routes.ts)` を更新し、ルーティングを追加:
    - コントローラから `deleteCanvas` をimport。
    - `canvasRoutes.delete("/canvas/:id", deleteCanvas);` を追加する。

### 4. クライアント側: Canvas削除APIサービス追加

- **目的**: 既存の `fetchCanvas` / `saveCanvas` と同じ `services` レイヤーで削除API呼び出しを定義する。
- **対応方針**:
  - `[apps/client/src/features/canvas/services/canvasApi.ts](apps/client/src/features/canvas/services/canvasApi.ts)` に `deleteCanvas` 関数を追加。
    - 型:
      - 戻り値 `Promise<{ ok: true } | { ok: false; message: string }>` 程度のシンプルなResult型とする。
    - 実装案:
      - `apiClient.delete("/api/canvas/${id}")` を呼び出す。
      - 204成功時は `{ ok: true }`。
      - エラー時は `saveCanvas` と同様のパターンでメッセージ抽出し `{ ok: false, message }` を返却。
  - `[apps/client/src/features/canvas/services/index.ts](apps/client/src/features/canvas/services/index.ts)` は `export * from "./canvasApi";` 済みのため、追加変更は不要（新関数は自動で外部公開される）。

### 5. クライアント側: 編集画面で削除処理を実行し一覧へ遷移

- **目的**: 既に実装済みの削除確認ダイアログから、実際の削除APIを呼び、完了後に一覧画面へ戻るフローを追加する。
- **対応方針**:
  - `[apps/client/src/pages/example/canvas-editor.tsx](apps/client/src/pages/example/canvas-editor.tsx)` に以下を追加・修正:
    - `deleteCanvas` を `@/features/canvas/services` からimportする。
    - 削除進行中フラグ `const [isDeleting, setIsDeleting] = useState(false);` を追加し、二重押下や並行操作を防ぐ。
    - 既存の `handleConfirmDelete` を実装:
      - `id` が存在しない（新規作成モード）場合は、安全側で単にダイアログを閉じて `/example/canvas` へ遷移（もしくはボタンを非表示のままでもよいが、現状 `isEditMode` により表示制御されているため通常は発生しない想定）。
      - `setIsDeleting(true)` の上で `deleteCanvas(id)` を呼ぶ。
      - 結果が `ok: true` → ダイアログを閉じて `navigate("/example/canvas")`。
      - 失敗時 → `setServerError(message)` で画面上部のエラーメッセージに表示し、ダイアログは閉じるかそのままか（今回は **ダイアログは閉じて画面にエラー表示**のシンプルな挙動とする）。
      - finally で `setIsDeleting(false)`。
    - `Delete` ボタンを `disabled={isDeleting || isSaving || isLoading}` などで無効化し、同時実行を防ぐ。
    - ダイアログ内「削除する」ボタンについても `isDeleting` を見て `disabled` にし、連打防止する（`DialogMessage` のButtonに `disabled` を渡すか、必要なら `DialogMessage` 側のpropsを拡張するが、最初の実装では親側ボタン（Delete本体）の制御のみでもよい）。

### 6. 動作確認項目

- **サーバー単体確認**:
  - ログイン状態で `DELETE /api/canvas/:id` を叩き、204が返ることを確認。
  - 存在しないIDで404と `{ error: { code: "NOT_FOUND", ... } }` が返ることを確認。
  - 未ログイン時に401と `{ error: { code: "UNAUTHORIZED", ... } }` が返ることを確認。
- **クライアントE2E確認**:
  - Canvas一覧画面から既存Canvasの編集画面へ遷移。
  - `Delete` ボタンを押すと警告ダイアログが表示され、「キャンセル」を押すと何も起こらないこと。
  - 「削除する」を押すとAPIが成功し、一覧 (`/example/canvas`) に戻り、対象Canvasが一覧から消えていること。
  - サーバーエラーを強制した場合に、編集画面上部のエラーメッセージが表示されること。

### 7. SOLID / 関心の分離チェック

- **サーバー**:
  - routes は URL と controller の紐付けのみで、ロジックを持たないことを維持する。
  - controller は `req/res` と usecaseの橋渡しに限定され、MongoやMongooseの具体実装に依存しない（Port/Adapter経由）。
  - usecase は Express非依存で、IDバリデーションと存在チェックのみを担当する。
- **クライアント**:
  - I/O は `services/canvasApi.ts` に閉じ込め、UI層（`canvas-editor.tsx`）ではサービス関数を呼ぶだけにする。
  - 画面コンポーネントは状態管理とナビゲーションのみを持ち、API詳細やエラーフォーマットには依存しないようにする。

