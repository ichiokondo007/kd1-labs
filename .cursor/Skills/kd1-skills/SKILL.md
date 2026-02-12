---
description: >
  Webアプリケーション構築スキル。React + TypeScript + Express + Catalyst UIコンポーネントを使用した
  プロダクショングレードのWebアプリを構築する。
  トリガー条件:
  (1) 画面・ページ・コンポーネントの新規作成、
  (2) UIレイアウトやフォームの実装、
  (3) Catalystコンポーネントを使った画面設計、
  (4) フロントエンド実装全般、
  (5) Express APIエンドポイントの実装、
  (6) Service / Repository層の設計・実装。
  技術スタック: Vite / React 19 / TypeScript / Express / Tailwind CSS v4 / Headless UI / Catalyst UI Kit。
---

# kd1-skills

- ReactベースのWebアプリケーション
- Catalyst UIコンポーネントと定義済み技術スタックに準拠してWebアプリケーションを構築する。

## 1.最初に読むべきリファレンス

タスクに応じて以下のリファレンスを参照する:

- **技術スタック全体を確認**: [references/tech-stack.md](references/tech-stack.md) を読む
- **レイヤーアーキテクチャ・設計方針**: [references/architecture-layers.md](references/architecture-layers.md) を読む
- **UI実装・コンポーネント選定**: [references/catalyst-components.md](references/catalyst-components.md) を読む
- **アプリ要件・画面仕様の確認**: [references/app-requirements.md](references/app-requirements.md) を読む

## 2.コア原則

```markdown

1. **Catalyst First**: UIコンポーネントは必ずCatalyst提供のものを最優先で使用する。Catalystに存在しないコンポーネントのみ自作する。
2. **型安全**: すべてのコンポーネントにTypeScriptの型定義を付与。`any`禁止。
3. **インポートパス統一**: Catalystコンポーネントは `@/components/{name}` からインポート。
4. **レイヤー分離**: ビジネスロジックはCustom Hook（Client）/ Service（Server）に集約し、
   UIやHTTP層から分離する。詳細は `architecture-layers.md` を参照。
5. **DB直接接続禁止**: クライアントからDBへ直接アクセスしない。必ずBackend REST API経由。
6. **型共有**: クライアント・サーバー間のDTO型は `packages/types` で一元管理する。
```

## 3.画面実装ワークフロー

```markdown
1. `references/app-requirements.md` で対象画面の仕様を確認
2. `references/catalyst-components.md` で使用コンポーネントを選定
3. レイアウト（Sidebar Layout / Stacked Layout / Auth Layout）を決定
4. `references/architecture-layers.md` でレイヤー配置を確認（Hook / Service / Repository）
5. Server Component / Client Component の境界を設計
6. 実装 → 型チェック → レビュー
```

## 4.コード規約

```typescript
// ファイル命名: kebab-case
user-profile-form.tsx

// コンポーネント命名: PascalCase
export function UserProfileForm() { ... }

// Catalystインポートは常にエイリアスパスを使用
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Field, Label, Description } from '@/components/fieldset'

// Heroiconsのサイズ使い分け
// 通常コンポーネント: 16px solid
import { PlusIcon } from '@heroicons/react/16/solid'
// Navbar/Sidebar: 20px solid
import { HomeIcon } from '@heroicons/react/20/solid'
```

## レイアウトパターン

Catalystは3つのレイアウトを提供:

| レイアウト     | 用途                     | 参照                               |
| -------------- | ------------------------ | ---------------------------------- |
| Sidebar Layout | ダッシュボード、管理画面 | `catalyst-components.md` > Layouts |
| Auth Layout    | ログイン、サインアップ   | `catalyst-components.md` > Layouts |
