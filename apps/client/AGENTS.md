# AGENTS.md (apps/client)

このドキュメントは `apps/client` 配下で AI エージェントが作業する際の **React 特化ルール**。
リポジトリルートの `AGENTS.md` と併せて適用する。

不明点は推測で決めない。推測が必要なら **推測である旨** を明示し、最小変更案を提示する。

create by KD

---

## 1. 最重要方針（Front-End 品質最優先）

このアプリではフロントエンド品質を最優先とする。

- 関心の分離（UI / 状態&副作用 / ドメイン）を崩さない
- SOLID（特に SRP/OCP/DIP）を意識して設計・レビューする
- 小さく安全に変更し、レビューしやすい差分を作る

---

## 2. 画面とUIの役割定義（混同禁止）

### 2.1 `pages/`

- **URL/画面単位の入口**
- 役割は「組み立て（オーケストレーション）」に限定する
- 原則：**薄く保つ**（描画の詳細・業務判断・I/O を持たない）

### 2.2 `features/<feature>/ui`

- **機能単位の画面・UI（Presentational）**
- 受け取った props を描画するのが主責務
- 禁止：API 直呼び出し / ルーティング依存 / ビジネスルールの埋め込み

---

## 3. 推奨ディレクトリ構成（機能単位）

> 既存構造に合わせつつ、追加する場合はこの形を基本とする

`src/features/<feature>/` に機能を閉じ込める：

- `ui/` : 描画（Presentational）
- `hooks/` : 状態管理・副作用・イベント制御（UIから分離）
- `services/` : I/O（fetch/axios/localStorage 等）
- `domain/` : ルール・計算・変換（純関数中心 / React非依存）
- `types.ts` : feature 内で閉じる型（外部共有は packages/types を検討）

### 3.1 依存方向（重要）

- `pages` → `features` → `components` は OK
- `components` → `features/pages` は禁止
- `ui` → `services` 直呼び出しは禁止（hooks 経由）
- `domain` は React を import しない

---

## 4. `_template` の運用（ボイラーテンプレート）

`src/features/_template/` は **ボイラーテンプレート専用** とする。

- `_template` は「新機能作成のひな型」であり、プロダクト機能は実装しない
- 新しい feature は原則 `_template` をコピーして作る
- `_template` の構造（ui/hooks/services/domain/types）を崩さない

### 4.1 新 feature 作成手順（原則）

1) `src/features/_template` をコピーして `src/features/<feature-name>` を作成  
2) `Template*` 命名を `<Feature>*` に変更  
3) `services` の API パス、`types`、`domain` ルールを機能要件に合わせて更新  
4) `pages/` から `<feature>/ui` のエントリを呼び出す（pagesは薄く）

---

## 5. React 設計レビュー（必ずチェック）

エージェントは実装後に必ず自己レビューを付ける。

### 5.1 SRP（単一責任）

- 1コンポーネントが「描画 + I/O + 業務判断」を同時に持っていないか？
- 描画は `ui/`、副作用は `hooks/`、ルールは `domain/` へ分離できているか？

### 5.2 OCP（拡張に強い）

- 要件追加で if/switch が増殖しない形か？
- 機能追加が feature 内で閉じる形になっているか？

### 5.3 DIP（依存性逆転）

- UIが fetch/axios に直接依存していないか？
- I/O は `services/` に集約し、hooks 経由で利用しているか？

---

## 6. 禁止事項（最小）

- UI（ui/ と components/）からの I/O 直呼び出し禁止
- domain/ で React import 禁止
- pages/ に業務判断の埋め込み禁止（薄く）
- 大きな状態をコンポーネントにベタ持ち禁止（hooksへ）

---

## 7. 変更プロトコル（client 内）

1) 目的を1行で明確化
2) 影響範囲（pages/features/components）を列挙
3) 最小変更で実装（既存パターン優先）
4) Storybook がある部品は story の更新/追加を検討
5) 最後に SOLID/関心の分離の観点で自己レビューを書く

---

## 8. KD1 固有ルール（詳細は kd1-skills に集約）

本プロジェクト固有の詳細ルール・手順・コンポーネント選定は **kd1-skills** に集約する。
本ドキュメント（AGENTS.md）には「常時守るべき最小宣言」のみを置く。

- 参照: `.cursor/skills/kd1-skills/SKILL.md`
- 参照: `.cursor/Skills/kd1-skills/references/*`

### 8.1 UI 方針（最小宣言）

- **Catalyst First**: UI は Catalyst UI コンポーネントを最優先で使用する（例外判断・一覧・使い方は kd1-skills を参照）
- **Import 統一**: Catalyst コンポーネントは `@/components/{name}` から import する
- **型安全**: `any` 禁止（暫定例外を作る場合は理由を明記して最小範囲に限定）

### 8.2 境界（最小宣言）

- **DTO 型共有**: Client/Server 間の DTO は `packages/types` を SSOT とする（重複定義しない）
- **I/O 禁止の再確認**: UI から API/Storage を直接呼ばず、`hooks` → `services` 経由に統一する