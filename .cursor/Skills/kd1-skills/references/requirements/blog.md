# Tech Blog Markdown Rendering 基盤 設計書

## 1. 概要
本ドキュメントは、React を用いて構築する Tech ブログサイトにおける **Markdown レンダリング基盤**の要件および設計方針をまとめたものである。

Markdown を GitHub README のように表示しつつ、編集（Edit）と閲覧（View）を切り替えられる UI を提供する。また、Markdown 内の特定要素（例：H1）に対してカスタムスタイルを適用できる柔軟な構成を採用する。

---

## 2. 要件

### 2.1 機能要件
- Markdown を HTML としてレンダリングできること
- GitHub Flavored Markdown（GFM）に対応すること
- Edit / View の切り替えが可能であること
- H1（`# 見出し`）に対して独自スタイルを適用できること
- コードブロックのハイライトに対応できる拡張性を持つこと
- 数式、絵文字、目次などの拡張にも対応可能な構造であること

### 2.2 非機能要件
- React コンポーネントとして再利用可能であること
- UI と Markdown パース処理が疎結合であること
- 拡張性が高く、プラグイン追加が容易であること
- TypeScript による型安全性を確保すること

---

## 3. 採用ライブラリ

### 3.1 `react-markdown`
- Markdown → React コンポーネント変換の中心
- AST ベースで拡張しやすい
- `components` により要素ごとのカスタムレンダリングが可能

### 3.2 `remark-gfm`
- GitHub Flavored Markdown をサポート
- 表、チェックボックス、URL 自動リンクなどが利用可能

### 3.3 オプション（必要に応じて）
| 機能             | ライブラリ                     |
| ---------------- | ------------------------------ |
| コードハイライト | `rehype-highlight`             |
| 数式             | `remark-math` + `rehype-katex` |
| 絵文字           | `remark-emoji`                 |
| 目次生成         | `remark-toc`                   |

---

## 4. アーキテクチャ設計

### 4.1 コンポーネント構成
```
/components
  ├─ MarkdownEditor.tsx   ← Edit モード
  ├─ MarkdownViewer.tsx   ← View モード
  └─ MarkdownRenderer.tsx ← react-markdown のラッパ
```

### 4.2 Edit / View 切り替え
- 状態管理（`useState`）でモードを保持
- Edit モード：`<textarea>` または Markdown エディタ（例：`react-mde`）
- View モード：`react-markdown` によるレンダリング

---

## 5. カスタムレンダリング設計

### 5.1 H1 のスタイル上書き
`react-markdown` の `components` を利用し、H1 のみ独自スタイルを適用する。

```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    h1: ({node, ...props}) => (
      <h1 className="text-4xl font-bold text-blue-600" {...props} />
    ),
  }}
>
  {content}
</ReactMarkdown>
```

### 5.2 他要素の拡張
- `code` → シンタックスハイライト
- `img` → Next.js Image などに差し替え
- `a` → 外部リンクアイコン付与

---

## 6. Edit / View UI 設計

### 6.1 状態管理
```tsx
const [mode, setMode] = useState<"edit" | "view">("edit");
const [text, setText] = useState<string>("# タイトル\n\n本文…");
```

### 6.2 UI 構成
- Edit ボタン
- View ボタン
- Edit モード：Markdown 入力欄
- View モード：Markdown レンダリング結果

---

## 7. サンプル実装

```tsx
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownEditor() {
  const [mode, setMode] = useState("edit");
  const [text, setText] = useState("# タイトル\n\n本文…");

  return (
    <div>
      <button onClick={() => setMode("edit")}>Edit</button>
      <button onClick={() => setMode("view")}>View</button>

      {mode === "edit" ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-80 border p-2"
        />
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>
      )}
    </div>
  );
}
```

---

## 8. 拡張性と今後の展望

### 8.1 追加予定の機能
- コードハイライト（`rehype-highlight`）
- 数式（`remark-math` + `rehype-katex`）
- 目次生成（`remark-toc`）
- カスタムテーマ（ダークモード対応）

### 8.2 将来的な構成
- Markdown AST を独自に加工するパイプライン
- 記事メタデータ（frontmatter）解析
- 記事検索・タグ付け

---

## 9. まとめ
本設計は、React を用いた Tech ブログにおいて、Markdown を柔軟かつ拡張可能に扱うための基盤を提供する。  
GitHub README のような表現力を持ちながら、UI 側でのカスタムレンダリングも容易であり、長期的な拡張にも耐えられる構成となっている。

---

必要であれば、  
**「記事データモデル（frontmatter）設計」**  
**「Markdown レンダリングパイプラインの図解」**  
**「Next.js 版の構成」**  
なども追加できます。

どこまで広げたいか教えてください。
