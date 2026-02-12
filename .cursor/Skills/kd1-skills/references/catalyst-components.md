# Catalyst UIコンポーネント リファレンス

公式ドキュメント: https://catalyst.tailwindui.com/docs

## 目次

1. [レイアウト](#レイアウト)
2. [コンポーネント一覧](#コンポーネント一覧)
3. [使用パターン](#使用パターン)
4. [アイコン規約](#アイコン規約)
5. [カスタムコンポーネント作成ガイド](#カスタムコンポーネント作成ガイド)

---

## レイアウト

### Sidebar Layout
用途: ダッシュボード、管理画面、メインアプリケーション。
```tsx
import { SidebarLayout } from '@/components/sidebar-layout'
import { Sidebar, SidebarBody, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
```

### Stacked Layout
用途: シンプルなアプリ、設定画面、ランディングページ。
```tsx
import { StackedLayout } from '@/components/stacked-layout'
import { Navbar, NavbarItem, NavbarLabel, NavbarSection } from '@/components/navbar'
```

### Auth Layout
用途: ログイン、サインアップ、パスワードリセット。
```tsx
import { AuthLayout } from '@/components/auth-layout'
```

---

## コンポーネント一覧

### データ表示

| コンポーネント | インポート元 | 用途 |
|---|---|---|
| Avatar | `@/components/avatar` | ユーザーアバター画像 |
| Badge / BadgeButton | `@/components/badge` | ステータスラベル、タグ（18色） |
| Description List | `@/components/description-list` | key-valueデータ表示 |
| Heading / Subheading | `@/components/heading` | 見出し |
| Text / TextLink / Strong / Code | `@/components/text` | テキスト表示 |
| Table / TableHead / TableBody / TableRow / TableCell | `@/components/table` | テーブル |

### フォーム

| コンポーネント | インポート元 | 用途 |
|---|---|---|
| Input / InputGroup | `@/components/input` | テキスト入力 |
| Textarea | `@/components/textarea` | 複数行入力 |
| Select | `@/components/select` | ネイティブセレクト |
| Listbox / ListboxOption | `@/components/listbox` | カスタムセレクト |
| Combobox | `@/components/combobox` | 検索付きセレクト |
| Checkbox / CheckboxField / CheckboxGroup | `@/components/checkbox` | チェックボックス |
| Radio / RadioField / RadioGroup | `@/components/radio` | ラジオボタン |
| Switch / SwitchField / SwitchGroup | `@/components/switch` | トグルスイッチ |
| Field / Label / Description / ErrorMessage / Fieldset / Legend | `@/components/fieldset` | フォームフィールドラッパー |

### アクション・ナビゲーション

| コンポーネント | インポート元 | 用途 |
|---|---|---|
| Button | `@/components/button` | ボタン（dark/light/white + 20色 + outline/plain） |
| Link | `@/components/link` | ルーターリンク |
| Dropdown / DropdownButton / DropdownItem / DropdownMenu | `@/components/dropdown` | ドロップダウンメニュー |
| Pagination | `@/components/pagination` | ページネーション |

### フィードバック・オーバーレイ

| コンポーネント | インポート元 | 用途 |
|---|---|---|
| Alert / AlertActions / AlertBody / AlertDescription / AlertTitle | `@/components/alert` | アラートダイアログ |
| Dialog / DialogActions / DialogBody / DialogDescription / DialogTitle | `@/components/dialog` | モーダルダイアログ |

### レイアウト補助

| コンポーネント | インポート元 | 用途 |
|---|---|---|
| Divider | `@/components/divider` | 区切り線 |
| Sidebar* | `@/components/sidebar` | サイドバー部品 |
| Navbar* | `@/components/navbar` | ナビバー部品 |

---

## 使用パターン

### フォームフィールドの基本パターン

FieldでラップしてLabel/Descriptionを自動接続:

```tsx
import { Field, Label, Description } from '@/components/fieldset'
import { Input } from '@/components/input'

function NameField() {
  return (
    <Field>
      <Label>氏名</Label>
      <Description>フルネームを入力してください</Description>
      <Input name="full_name" />
    </Field>
  )
}
```

### Buttonバリアント

```tsx
<Button>Primary</Button>              {/* デフォルト dark */}
<Button color="cyan">Accent</Button>  {/* カラー指定 */}
<Button outline>Secondary</Button>    {/* アウトライン */}
<Button plain>Tertiary</Button>       {/* プレーン */}
<Button disabled>Disabled</Button>    {/* 無効化 */}
```

### テーブルパターン

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'

<Table>
  <TableHead>
    <TableRow>
      <TableHeader>Name</TableHeader>
      <TableHeader>Status</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow href="/users/1">  {/* 行全体がリンクになる */}
      <TableCell>Alice</TableCell>
      <TableCell><Badge color="lime">Active</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Dialogパターン

```tsx
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Button } from '@/components/button'

const [isOpen, setIsOpen] = useState(false)

<Dialog open={isOpen} onClose={setIsOpen}>
  <DialogTitle>確認</DialogTitle>
  <DialogDescription>この操作は取り消せません。</DialogDescription>
  <DialogBody>...</DialogBody>
  <DialogActions>
    <Button plain onClick={() => setIsOpen(false)}>キャンセル</Button>
    <Button onClick={handleConfirm}>実行</Button>
  </DialogActions>
</Dialog>
```

---

## アイコン規約

| コンテキスト | サイズ | インポート元 |
|---|---|---|
| Button, DropdownItem, ListboxOption | 16×16 | `@heroicons/react/16/solid` |
| NavbarItem, SidebarItem | 20×20 | `@heroicons/react/20/solid` |
| 大きめの装飾用 | 24×24 | `@heroicons/react/24/outline` |

---

## カスタムコンポーネント作成ガイド

Catalystに存在しないコンポーネントを自作する場合:

1. Headless UIのプリミティブ（`@headlessui/react`）をベースにする
2. Tailwind CSSのデフォルトテーマ変数を使用する
3. Catalystの既存コンポーネントのスタイルパターン（色、影、角丸、spacing）に合わせる
4. ダークモード対応（`dark:` バリアント）を必ず含める
5. `clsx` でクラス名を条件結合する

```tsx
// カスタムコンポーネントの例: Catalystスタイルに合わせたToast
import clsx from 'clsx'

export function Toast({ variant = 'info', children }: { variant?: 'info' | 'success' | 'error', children: React.ReactNode }) {
  return (
    <div className={clsx(
      'rounded-lg p-4 text-sm shadow-lg ring-1',
      variant === 'info' && 'bg-blue-50 text-blue-900 ring-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-800',
      variant === 'success' && 'bg-green-50 text-green-900 ring-green-200 dark:bg-green-950 dark:text-green-200 dark:ring-green-800',
      variant === 'error' && 'bg-red-50 text-red-900 ring-red-200 dark:bg-red-950 dark:text-red-200 dark:ring-red-800',
    )}>
      {children}
    </div>
  )
}
```
