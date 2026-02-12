# Canvas App 一覧画面 設計書

## 1. 概要

Canvas App の一覧画面（EXAMPLE-01）の設計・実装仕様をまとめたドキュメント。
Fabric.js を使ったお絵描きアプリの Canvas データを一覧表示し、検索・ソート・ページネーション機能を提供する。

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| 画面ID       | EXAMPLE-01                          |
| 画面名       | Canvas App 一覧                     |
| パス         | `/example/canvas`                   |
| レイアウト   | Sidebar Layout（DashboardLayout）   |
| ステータス   | フロントエンドのみ実装（モックデータ）|

---

## 2. 画面仕様

### 2.1 ページヘッダー

- **タイトル**: "Example > Canvas App"（`Heading` コンポーネント）
- **サブタイトル**: "Fabric.js canvas application Example"（`Text` コンポーネント）

### 2.2 検索・ソートバー

| 要素           | コンポーネント                          | 説明                              |
| -------------- | --------------------------------------- | --------------------------------- |
| 検索入力       | `InputGroup` + `Input type="search"`    | Canvas名・説明・更新者名で絞り込み |
| 検索アイコン   | `MagnifyingGlassIcon`                   | `@heroicons/react/20/solid`       |
| ソートセレクト | `Select`                                | updatedAt / name / updaterName    |
| 作成ボタン     | `Button color="dark/zinc"`              | "Create canvas"                   |

### 2.3 一覧リスト

各アイテムは横並びレイアウト（サムネイル左 + 情報右）で、`Divider soft` で区切る。

| 要素               | 説明                                              |
| ------------------ | ------------------------------------------------- |
| サムネイル         | 固定サイズ（sm:w-32 h-20 / lg:w-40 h-24）、モバイルでは非表示 |
| サムネイル無し     | "No image" プレースホルダー表示                   |
| Canvas名           | `TextLink` でリンク（`/example/canvas/:id`）      |
| 更新日時 + 説明    | `Text` で "Jun 2, 2024 at 8 PM · 説明テキスト"   |
| 更新者             | `Avatar`（size-6、initials fallback）+ 名前       |

### 2.4 ページネーション

- ページサイズ: 6件
- `Pagination`, `PaginationPrevious`, `PaginationNext`, `PaginationList`, `PaginationPage`, `PaginationGap` を使用
- 7ページ以下の場合は全ページ番号表示、それ以上は gap（…）を挿入

---

## 3. データモデル

### 3.1 型定義

```typescript
interface CanvasItem {
  id: string
  name: string
  thumbnailUrl: string | null
  updatedAt: Date
  description: string
  updater: {
    name: string
    avatarUrl: string | null
    initials: string
  }
}

type SortKey = 'name' | 'updatedAt' | 'updaterName'
```

### 3.2 モックデータ

15件の `CanvasItem` を定義（ページサイズ6で3ページ分）。
バックエンド実装時に API レスポンスに置き換える想定。

---

## 4. 状態管理

`useSearchParams()`（react-router-dom）によるURL駆動の状態管理を採用。

| パラメータ | 型       | デフォルト   | 説明             |
| ---------- | -------- | ------------ | ---------------- |
| `q`        | string   | `""`         | 検索クエリ       |
| `sort`     | SortKey  | `"updatedAt"`| ソートキー       |
| `page`     | number   | `1`          | 現在のページ番号 |

- 検索入力の変更時に `page` パラメータをリセット
- デフォルト値の場合はURLパラメータを省略（クリーンなURL）

---

## 5. ヘルパー関数

| 関数名           | 引数                              | 戻り値                  | 説明                                          |
| ---------------- | --------------------------------- | ----------------------- | --------------------------------------------- |
| `formatDate`     | `date: Date`                      | `string`                | "Jun 2, 2024 at 8 PM" 形式にフォーマット      |
| `getPageNumbers` | `current: number, total: number`  | `(number \| 'gap')[]`  | ページ番号配列を生成（gap挿入ロジック含む）    |
| `buildPageUrl`   | `page: number, searchParams: URLSearchParams` | `string` | ページネーション用のURL文字列を構築 |

---

## 6. コンポーネント構成

### 6.1 ファイル構成

```
src/
├── pages/
│   └── example/
│       └── canvas-list.tsx    ← 一覧画面コンポーネント（新規作成）
└── App.tsx                    ← ルーティング定義（変更）
```

### 6.2 使用コンポーネント一覧

| コンポーネント          | インポート元                  | 用途                     |
| ----------------------- | ----------------------------- | ------------------------ |
| `Heading`               | `@/components/heading`        | ページタイトル           |
| `Text`                  | `@/components/text`           | サブタイトル、日時、説明 |
| `TextLink`              | `@/components/text`           | Canvas名リンク           |
| `Button`                | `@/components/button`         | "Create canvas" ボタン   |
| `Input`                 | `@/components/input`          | 検索入力                 |
| `InputGroup`            | `@/components/input`          | 検索入力のラッパー       |
| `Select`                | `@/components/select`         | ソートドロップダウン     |
| `Avatar`                | `@/components/avatar`         | 更新者アバター           |
| `Divider`               | `@/components/divider`        | リストアイテム間の区切り |
| `Pagination` 関連       | `@/components/pagination`     | ページネーション一式     |
| `MagnifyingGlassIcon`   | `@heroicons/react/20/solid`   | 検索アイコン             |

---

## 7. ルーティング

### App.tsx の変更

```tsx
import CanvasListPage from '@/pages/example/canvas-list'

// Route定義内
<Route path="/example/canvas" element={<CanvasListPage />} />
```

Canvas 個別ページ（編集画面）は `/example/canvas/:id` として今後追加予定。

---

## 8. レスポンシブ対応

| ブレークポイント | レイアウト変更                                   |
| ---------------- | ------------------------------------------------ |
| モバイル（default）| サムネイル非表示、検索バー縦並び、ページ番号非表示 |
| sm (640px+)      | サムネイル表示（w-32 h-20）、検索バー横並び       |
| lg (1024px+)     | サムネイル拡大（w-40 h-24）、パディング拡大       |

---

## 9. 今後の拡張予定

- バックエンド API 連携（モックデータを API コールに置換）
- Canvas 編集画面（`/example/canvas/:id`）の実装（`fablicjs.html` ワイヤーフレーム参照）
- "Create canvas" ボタンのアクション実装
- サムネイル画像の実データ連携
- リアルタイム共同編集（Yjs 統合、`/example/canvas-yjs` として別途実装予定）
