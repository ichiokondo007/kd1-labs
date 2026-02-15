# AGENTS.md (KD1)

このリポジトリで AI エージェントが作業する際の「常時適用ルール」。
不明点は推測で決めない。推測が必要なら **推測である旨** を明示し、最小変更案を提示する。

---

## 1. リポジトリ構成（事実）

- `apps/client/` : React (Vite) + Storybook
- `apps/server/` : Express API (TypeScript)
- `packages/types/` : 共有型定義
- `packages/db-schema/` : Drizzle schema / migration 設計
- `packages/db-client/` : DB クライアント（利用側からの窓口）
- `docker/` / `docker-compose.yml` : MySQL 等の開発用
- `.cursor/Skills/kd1-skills/` : 独自 skill / references
- `.cursor/Skills/versel-skills/` : react,typescript用のskills

---

## 2. 最重要方針（Front-End 優先）

このリポジトリでは **フロント（apps/client）品質を最優先**とする。
特に以下を守る：

- **関心の分離**（UI / 状態 / ドメイン判断 / I/O を分ける）
- **SOLID** を意識した設計（特に SRP, OCP, DIP）
- 変更は「小さく・安全に・レビューしやすく」

---

## 3. アーキテクチャ原則（層と依存方向）

### 3.1 クライアント（apps/client）

推奨レイヤー（既存の構造に合わせて “増やす” のではなく “寄せる”）：

- `components/` : 再利用 UI（基本的に Presentational）
- `pages/` : 画面（ルーティング単位）
- `layouts/` : レイアウト枠組み
- **追加する場合の推奨**：
  - `features/<feature>/` : 機能単位（UI + hooks + model）
  - `hooks/` : 状態管理 / データ取得（React の外に判断を出す）
  - `services/` : API クライアント、I/O
  - `domain/` : UI から独立したルール・計算（純関数中心）
**依存方向（重要）**

- `pages/features` → `components` は OK
- `components` → `pages/features` は禁止（逆流させない）
- `components` は **API 直呼び出し禁止**
- `components` は **fetch/axios 等の I/O 禁止**
- `domain` は React に依存しない（import しない）

### 3.2 サーバ（apps/server）

- route handler は薄く（入力→usecase→出力）
- DB / 外部 I/O は `packages/db-client` などに集約
- SQL 直書き・巨大な handler を作らない

### 3.3 packages

- `packages/types` は **境界の契約**（DTO/型）
- `packages/db-schema` は **DB 構造の唯一の真実（SSOT）**
- `packages/db-client` は **DB へのアクセス窓口**（利用側の依存を一定化）

---

## 4. React の設計ルール（関心の分離チェックリスト）

エージェントは PR 生成やレビュー時に必ずチェックする：

### 4.1 SRP（単一責任）

- コンポーネントが「描画」と「業務判断」と「データ取得」を同時に持っていないか？
  - 望ましい分割：
    - Presentational Component：props を受けて描画のみ
    - Container / Hook：取得・状態・イベントを扱い props を組み立てる
    - Domain Function：判定/整形/計算（UIと独立）

### 4.2 OCP（拡張に強い）

- 追加要件で `if/switch` が増殖しない形になっているか？
- 変更点が局所化されているか？（機能単位の閉じ込め）

### 4.3 DIP（依存性逆転）

- UI が具体的な API 実装に依存していないか？
  - `services/apiClient` のような窓口を作り、UI はそれに依存する
  - テスト時に差し替え可能な形（interface / 関数注入）を優先

### 4.4 命名と責務

- `useXxx` は “状態/データ取得/副作用” を担う
- `xxx.ts`（domain）は “純粋関数中心 JunitTest必須”
- `components` は “UI 部品” に徹する

---

## 5. 認証（Example 方針）

- セッション方式（cookie + server session）を採用する前提
- UI 側は「ログイン状態の判定」と「未ログイン時の遷移/表示制御」に責務を限定
- 認可（権限判定）を入れる場合は `can(action, resource, ctx)` のように窓口を統一し、
  UI と API の判定差異を作らない

---

## 6. エラーレスポンス（未確定のため暫定ルール）

現時点は “破綻しない最小” として以下を推奨する。
既存が決まったら本セクションを更新して、それ以外は禁止にする。

- success: `{ data: ... }`
- error: `{ error: { code: string, message: string, details?: unknown } }`

※ requestId 等は後で導入してよい（今は必須にしない）

---

## 7. テストと Storybook（Front 重視）

- `apps/client` の UI 変更は可能なら Storybook の story を追加/更新
- UI の責務分離ができている場合、Presentational は Storybook で検証しやすい
- ドメイン関数は unit test（可能なら）に切り出す

---

## 8. 変更プロトコル（エージェント作業手順）

1. 目的（何を満たすか）を 1 行で書く
2. 影響範囲を列挙（client/server/packages/db/docs）
3. 最小変更で実装（既存流儀に寄せる）
4. 動作確認手順を必ず書く（起動コマンド / 画面 / API）
5. 最後に **SOLID/関心の分離の観点で自己レビュー** を付ける

---

## 9. 迷ったときの優先順位

1) セキュリティとデータ保護（セッション・パスワード・秘密情報）
2) フロントの関心の分離（品質最優先）
3) 一貫性（既存の構造・命名に合わせる）
4) シンプルさ（Example なので過剰設計しない）