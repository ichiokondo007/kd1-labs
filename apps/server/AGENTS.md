# AGENTS.md (apps/server)

このドキュメントは `apps/server` 配下で AI エージェントおよび開発者が守るべき
**バックエンド設計憲法** である。

不明点は推測で実装しない。
推測が必要な場合は明示し、最小変更案を提示する。

---

## 1. 設計方針（最重要）

- Express は HTTP Adapter として扱う。
ビジネスロジックは HTTP から分離する。
- 「クリーンアーキテクチャのエッセンスを取り入れた、レイヤードアーキテクチャで実装する事。
- 理由）関心事の分離。ビジネスロジックはバニラ実装、Unitテスト実施。（テスト戦略）
- 依存の向きは routes → controllers → usecases で、usecase は Port に依存し Adapter は composition で注入
- 実装パターンは、ヘキサゴナルアーキテクチャ（ports and adapterパターン）でDI実装。

---

## 2. ディレクトリ構造（必須）

```shell

src
├── adapters
├── composition
├── controllers
├── index.ts
├── lib
├── ports
├── routes
└── usecases

8 directories, 1 file

```

| レイヤー     | 役割                                     |
| :----------- | :--------------------------------------- |
| index.ts     | middleware・routes マウント・listen のみ |
| routes/      | URL と controller の対応のみ             |
| controllers/ | req/res ⇄ DTO、status、usecase 呼び出し  |
| usecases/    | ビジネスロジック、Express 非依存         |
| ports/       | インターフェース（I/O の抽象）           |
| adapters/    | Port の実装（スタブ or DB 等）           |
| composition/ | usecase と adapter の組み立て（DI）      |
| lib/         | Result 型など共通                        |

### 2.1 index.ts

- middleware 設定
- routes の mount
- listen のみ
- 業務ロジックを書かない

---

### 2.2 routes/

- URL と controller を結ぶだけ
- ロジックを書かない

---

### 2.3 controllers/

- req/res ⇄ DTO 変換
- status code 決定
- レスポンス整形
- **JSDoc 必須**
- usecase を呼び出すだけ

禁止:

- DBアクセス
- ビジネス判断の埋め込み
- Express 以外の副作用増殖

---

### 2.4 usecases/

- ビジネスロジック専用
- Express import 禁止
- req/res 禁止
- 戻り値は Result 型などで型安全に表現

---

### 2.5 lib/

- 共通ユーティリティ
- Result型
- Logger等

---

## 3. 依存方向（厳守）

routes → controllers → usecases

usecases は Express に依存しない。

逆方向依存は禁止。

---

## 4. DTO ルール

- Client/Server共有型は `@kd1-labs/types` を使用
- HTTP専用の型が必要な場合は server内に定義する
- 重複定義禁止

---

## 5. Endpoint ルール

- JSDoc 必須（route / 入出力 / status）
- 例外は controller で HTTP に変換する
- usecase で HTTP status を決めない
