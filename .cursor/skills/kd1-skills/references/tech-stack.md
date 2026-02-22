# 技術スタック

## 目次

- [技術スタック](#技術スタック)
  - [目次](#目次)
  - [フレームワーク・ランタイム](#フレームワークランタイム)
    - [client](#client)
  - [UIライブラリ](#uiライブラリ)
    - [Tailwind CSS v4 設定](#tailwind-css-v4-設定)
  - [状態管理・データフェッチ](#状態管理データフェッチ)
  - [認証・認可](#認証認可)
  - [テスト](#テスト)
  - [開発ツール](#開発ツール)
  - [依存関係一覧](#依存関係一覧)
    - [プロダクション依存](#プロダクション依存)
    - [開発依存](#開発依存)

---

## フレームワーク・ランタイム

| 技術       | バージョン | 用途         |
| ---------- | ---------- | ------------ |
| React      | 19.x       | UIライブラリ |
| express    |            | server       |
| TypeScript | 5.x        | 型安全       |
| Node.js    | 22.x LTS   | ランタイム   |

### client

```bash
src/
├── app/                    # App Router
│   ├── layout.tsx          # Root layout（Catalystレイアウト適用）
│   ├── page.tsx            # トップページ
│   ├── (auth)/             # 認証グループ
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/        # ダッシュボードグループ
│   │   ├── layout.tsx      # Sidebar Layout適用
│   │   └── ...
│   └── api/                # API Routes
├── components/
│   ├── catalyst/           # TODO: Catalystコンポーネント配置先
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── app/                # アプリ固有コンポーネント
├── lib/                    # ユーティリティ・ヘルパー
├── types/                  # 共有型定義
└── styles/                 # グローバルCSS
```

> **TODO**: `components/catalyst/` のパスは実際のプロジェクト構成に合わせて変更する。
> Catalystの公式ドキュメントでは `@/components/` エイリアスで参照する前提。

---

## UIライブラリ

| 技術                   | バージョン | 用途                           |
| ---------------------- | ---------- | ------------------------------ |
| Tailwind CSS           | v4.x       | ユーティリティCSS              |
| Headless UI            | v2.x       | アクセシブルなUIプリミティブ   |
| Catalyst UI Kit        | latest     | プロダクションUIコンポーネント |
| Heroicons              | latest     | アイコン（16px/20px/24px）     |
| motion (Framer Motion) | latest     | アニメーション                 |
| clsx                   | latest     | 条件付きクラス名結合           |

### Tailwind CSS v4 設定

```css
/* app.css */
@import "tailwindcss";

@theme {
  --font-sans: Inter, sans-serif;
  --font-sans--font-feature-settings: 'cv11';
}
```

---

## 状態管理・データフェッチ

| 技術                     | 用途                                       |
| ------------------------ | ------------------------------------------ |
| React Server Components  | サーバーサイドデータフェッチ               |
| Server Actions           | フォーム送信・ミューテーション             |
| TODO: 状態管理ライブラリ | クライアント状態管理（Zustand / Jotai 等） |
| TODO: データフェッチ     | SWR / TanStack Query 等                    |

> **TODO**: プロジェクトの要件に応じて状態管理・データフェッチライブラリを選定する。

---

## 認証・認可

| 技術                     | 用途                           |
| ------------------------ | ------------------------------ |
| TODO: 認証プロバイダ     | NextAuth.js / Clerk / Auth0 等 |
| TODO: 認可フレームワーク | Bouncer（自作RBAC/ABAC）       |

> **TODO**: 認証・認可の実装方針を記載する。

---

## テスト

| 技術                       | 用途                 |
| -------------------------- | -------------------- |
| TODO: ユニットテスト       | Vitest / Jest        |
| TODO: E2Eテスト            | Playwright / Cypress |
| TODO: コンポーネントテスト | Testing Library      |

---

## 開発ツール

| 技術        | 用途                 |
| ----------- | -------------------- |
| pnpm        | パッケージマネージャ |
| ESLint      | Linting              |
| Prettier    | フォーマッティング   |
| TODO: CI/CD | GitHub Actions 等    |

---

## 依存関係一覧

### プロダクション依存

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "@headlessui/react": "^2",
    "motion": "latest",
    "clsx": "latest",
    "@heroicons/react": "latest"
  }
}
```

### 開発依存

```json
{
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^4",
    "@types/react": "^19",
    "@types/node": "^22"
  }
}
```
