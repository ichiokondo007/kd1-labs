---
name: kd1-skills
description: >
  KD1 プロジェクト専用の実装ガイド（手順書）。
  React + TypeScript + Express + Catalyst UI を用いた Web アプリケーションを、
  定義済みアーキテクチャと技術スタックに準拠して構築する際に使用する。
  本 Skill は「どう実装するか（手順・選定・参照）」を提供し、
  常時適用の設計憲法は AGENTS.md に従う。
---

# kd1-skills

## 0. 役割分離（最重要）

- **AGENTS.md**（憲法）: 常時適用。構造・依存方向・禁止事項・作業プロトコルを定義する。
- **kd1-skills**（手順書）: 実装時に参照。具体的な作業手順・選定ガイド・確認フロー・参照リンクを提供する。

本 Skill は「詳細なやり方」を扱い、AGENTS.md と矛盾する場合は **AGENTS.md を優先**する。

---

## 1. 最初に読むべきリファレンス

タスクに応じて以下を参照する:

- 技術スタック: `references/tech-stack.md`
- UIカタログ（Catalyst）: `references/catalyst-components.md`

> NOTE: 追加の設計資料が増える場合は `references/` に集約し、このセクションに導線を追加する。

---

## 2. 必ず守るルール（KD1 Must Rules）

### 2.1 Feature は必ず `_template` から作成（単一責務・レイヤー分離の強制）

新しい機能（feature）は必ず以下で作る:

1) `src/features/_template/` をコピーして `src/features/<feature-name>/` を作成  
2) `Template*` 命名を `<Feature>*` に置換  
3) `ui/hooks/services/domain/types` の構造を崩さない

目的:

- レイヤー毎の単一責務（SRP）を構造で強制する
- UI 直I/O、domain の肥大化、pages の肥大化を防ぐ

---

### 2.2 Catalyst 優先（Catalyst First）

- UI は **Catalyst UI Kit を最優先**
- Catalyst に存在しない場合のみ自作（その際も `components/` に横断部品として追加するか、feature 内に閉じ込めるかを判断する）
- 既存 Catalyst パターン（Layout / Form / Table 等）に合わせる

参照:

- `references/catalyst-components.md`

---

### 2.3 DTO の管理場所（SSOT）

- Client/Server 間で共有される DTO 型は **`packages/types` を唯一の真実（SSOT）** とする
- UI 専用（表示用VMなど）で閉じる型は feature 内 `types.ts` に置く
- `apps/client` と `apps/server` で DTO を重複定義しない

---

### 2.4 import 規約（Catalyst / alias 統一）

Catalyst コンポーネントは必ず alias import を使用する:

```ts
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Field, Label, Description } from '@/components/fieldset'