# レイヤーアーキテクチャ設計

## 目次

1. [設計原則](#設計原則)
2. [全体アーキテクチャ](#全体アーキテクチャ)
3. [Monorepo構成](#monorepo構成)
4. [クライアント側レイヤー構成](#クライアント側レイヤー構成)
5. [サーバー側レイヤー構成](#サーバー側レイヤー構成)
6. [共有パッケージ](#共有パッケージ)
7. [レイヤー間の依存ルール](#レイヤー間の依存ルール)
8. [ユニットテスト戦略](#ユニットテスト戦略)
9. [DB戦略](#db戦略)

---

## 設計原則

| 原則                   | 説明                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| 単一責務               | 各レイヤーは1つの関心事のみ担当する                                     |
| UI/ロジック分離        | ビジネスロジックはUIコンポーネントから切り離す                          |
| DB直接接続禁止         | クライアントからDBへ直接アクセスしない。必ずBackend REST APIを経由する  |
| HTTP非依存のロジック層 | Server Service層は `req` / `res` に依存しない純粋なロジックとする       |
| テスタビリティ優先     | 各レイヤーが独立してユニットテスト可能であること                        |
| 型の共有               | クライアント・サーバー間のDTO・型定義は `packages/types` で一元管理する |

---

## 全体アーキテクチャ

```markdown

apps/client (Vite + React)        apps/server (Express)
─────────────────────────         ─────────────────────
Component (表示)                  Route (パス定義)
    ↓                                 ↓
Custom Hook (UIロジック)          Controller (HTTP変換)
    ↓                                 ↓
Service (API呼び出し)             Service (ビジネスロジック) ★テスト核
    ↓ REST API                        ↓
    ──────────────────────────→  Repository (DB抽象化)
                                      ↓
                                 MySQL / MongoDB / Redis

         packages/types
    ─────────────────────────
    DTO / Entity / 共有型定義
    （client・server 両方から参照）
```

---

## Monorepo構成

```shell
.
├── apps/
│   ├── client/              # Vite + React（フロントエンド）
│   └── server/              # Express（バックエンドAPI）
├── packages/
│   └── types/               # 共有型定義（DTO・Entity）
├── pnpm-workspace.yaml
└── package.json
```

> **ポイント**: `packages/types` でクライアント・サーバー間の型を共有する。
> APIリクエスト/レスポンスの型不一致を防ぎ、型安全なREST通信を実現する。

---

## クライアント側レイヤー構成

### 現在の構成と拡張方針

```shell
apps/client/src/
├── components/              # Catalyst UIコンポーネント（既存）
│   ├── button.tsx
│   ├── input.tsx
│   ├── sidebar-layout.tsx
│   └── ...
│
├── features/                # 【追加】機能単位（Feature-based構成）
│   └── {feature}/
│       ├── components/      # 機能固有のUIコンポーネント
│       ├── hooks/           # UIビジネスロジック層
│       ├── services/        # API呼び出し・データ変換
│       ├── types/           # 機能固有の型定義
│       └── utils/           # 機能固有の純粋関数
│
├── hooks/                   # 【追加】共通カスタムフック（useAuth, useDebounce 等）
├── services/                # 【追加】共通APIクライアント（apiClient.ts）
├── utils/                   # 【追加】共通純粋関数ユーティリティ
│
├── layouts/                 # レイアウトコンポーネント（既存）
│   └── dashboard-layout.tsx
├── pages/                   # ページコンポーネント（既存）
│   └── home.tsx
│
├── App.tsx                  # ルーティング定義
└── main.tsx                 # エントリーポイント
```

### 各レイヤーの責務

#### `components/` — Catalyst UI（表示専用）

- Catalyst提供のUIプリミティブ。ロジックを追加しない
- Storybook（`.stories.tsx`）でコンポーネント単体の確認に使用

#### `pages/` — ページコンポーネント

- 責務: ルーティング単位のビュー。「**何を見せるか**」
- Custom Hookからデータとコールバックを受け取り、Catalystコンポーネントで描画する
- 制約: ビジネスロジック・API呼び出しを直接含めない

```typescript
// pages/user-edit.tsx
export const UserEditPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, errors, submit } = useUserForm(id!);

  if (!user) return <Loading />;

  return <UserForm user={user} errors={errors} onSubmit={submit} />;
};
```

#### `features/{feature}/hooks/` — UIビジネスロジック

- 責務: 状態管理、バリデーション、条件分岐。「**どう振る舞うか**」
- 制約: JSXを返さない。UIの見た目に関与しない
- バリデーション等の純粋ロジックは `utils/` に切り出してテスト容易性を高める

```typescript
// features/user/hooks/useUserForm.ts
export const useUserForm = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    userApi.getById(userId).then(setUser);
  }, [userId]);

  const validate = (values: UserFormValues): boolean => {
    const result = validateUserForm(values); // utils/ の純粋関数
    setErrors(result.errors);
    return result.isValid;
  };

  const submit = async (values: UserFormValues) => {
    if (!validate(values)) return;
    await userApi.update(userId, values);
  };

  return { user, errors, submit };
};
```

#### `features/{feature}/services/` — API通信

- 責務: REST API呼び出し、レスポンス変換。「**どこからデータを取るか**」
- 制約: 状態管理・UI関連の処理を含めない
- リクエスト/レスポンスの型は `packages/types` から参照する

```typescript
// features/user/services/userApi.ts
import type { User, UpdateUserDto, PaginatedResponse } from '@repo/types';

export const userApi = {
  getById: (id: string) =>
    apiClient.get<User>(`/users/${id}`),

  update: (id: string, data: UpdateUserDto) =>
    apiClient.put<User>(`/users/${id}`, data),

  list: (params: UserListParams) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params }),
};
```

---

## サーバー側レイヤー構成

**MVCではなく Controller → Service → Repository パターンを採用する。**
Express APIサーバーには「View」が存在しないため、MVCの命名は責務配置を曖昧にする。

### ディレクトリ構成

```shell
apps/server/src/
├── routes/                  # ルーティング定義のみ
│   └── userRoutes.ts
│
├── controllers/             # リクエスト/レスポンス変換
│   └── userController.ts
│
├── services/                # ★ ビジネスロジック（テストの核）
│   └── userService.ts
│
├── repositories/            # データアクセス抽象化
│   ├── interfaces/          # Repository インターフェース定義
│   │   └── IUserRepository.ts
│   ├── mysql/               # MySQL実装
│   │   └── userMysqlRepo.ts
│   ├── mongo/               # MongoDB実装
│   │   └── documentMongoRepo.ts
│   └── redis/               # Redis実装
│       └── sessionRedisRepo.ts
│
├── middleware/               # 横断的関心事
│   ├── auth.ts              # 認証
│   ├── bouncer.ts           # 認可（RBAC/ABAC）
│   ├── errorHandler.ts      # エラーハンドリング
│   └── requestLogger.ts     # リクエストログ
│
├── utils/                   # 純粋関数ユーティリティ
├── config/                  # 環境設定
└── index.ts                 # エントリーポイント（既存）
```

### 各レイヤーの責務

#### Route層

- 責務: HTTPメソッド + パスの定義のみ
- 制約: ロジックを含めない

```typescript
// routes/userRoutes.ts
const router = Router();
router.get('/:id', authMiddleware, userController.getById);
router.put('/:id', authMiddleware, bouncer('user:update'), userController.update);
export default router;
```

#### Controller層

- 責務: `req` → パラメータ抽出・バリデーション、`res` ← レスポンス成形・HTTPステータス
- 制約: ビジネスロジックを含めない。Service層に委譲する

```typescript
// controllers/userController.ts
export const userController = {
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.findById(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
};
```

#### Service層（★ テストの核）

- 責務: 純粋なビジネスロジック。「**何をするか**」
- 制約: **`req` / `res` を絶対に参照しない。** HTTP層から完全に独立する
- 複数Repositoryを組み合わせた処理を行う
- 型定義は `packages/types` から参照する

```typescript
// services/userService.ts
import type { UserDto, UpdateProfileInput } from '@repo/types';

export const userService = {
  findById: async (id: string): Promise<UserDto> => {
    const user = await userRepo.findById(id);         // MySQL
    const preferences = await prefsRepo.get(id);       // Redis
    return mapToUserDto(user, preferences);
  },

  updateProfile: async (id: string, data: UpdateProfileInput): Promise<UserDto> => {
    const user = await userRepo.findById(id);
    if (!user) throw new NotFoundError('User');

    const updated = await userRepo.update(id, data);
    await cacheRepo.invalidate(`user:${id}`);          // Redis
    await activityRepo.log({                           // MongoDB
      userId: id,
      action: 'profile_update',
    });

    return mapToUserDto(updated);
  },
};
```

#### Repository層

- 責務: DB操作の抽象化。「**どこにデータがあるか**」
- 制約: ビジネスロジックを含めない。CRUDおよびクエリ操作のみ
- インターフェースで抽象化し、DB実装を隠蔽する

```typescript
// repositories/interfaces/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: CreateUserInput): Promise<UserEntity>;
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}

// repositories/mysql/userMysqlRepo.ts
export class UserMysqlRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] ?? null;
  }
  // ...
}
```

---

## 共有パッケージ

### `packages/types` の役割

クライアント・サーバー間で共有する型定義を一元管理する。

```
packages/types/src/
├── index.ts                 # re-export
├── dto/                     # データ転送オブジェクト（API境界の型）
│   ├── user.dto.ts
│   └── auth.dto.ts
├── entities/                # ドメインエンティティ
│   └── user.entity.ts
├── api/                     # APIリクエスト/レスポンス型
│   ├── request.ts
│   └── response.ts
└── common/                  # 共通ユーティリティ型
    ├── pagination.ts
    └── error.ts
```

### 型共有のルール

```typescript
// packages/types/src/dto/user.dto.ts
export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

// --- クライアントでの使用 ---
// apps/client/src/features/user/services/userApi.ts
import type { UserDto, UpdateUserDto } from '@repo/types';

// --- サーバーでの使用 ---
// apps/server/src/services/userService.ts
import type { UserDto, UpdateUserDto } from '@repo/types';
```

> **重要**: Entity型（DB層の内部表現）は `packages/types` に含めてもよいが、
> クライアントが直接参照するのはDTO型のみとする。
> Entity → DTO の変換はServer Service層で行う。

---

## レイヤー間の依存ルール

### 許可される依存方向（上 → 下のみ）

```
Client:  Page → Hook → Service → [REST API]
Server:  Route → Controller → Service → Repository → DB

共有:    Client・Server 両方 → packages/types（型のみ）
```

### 禁止事項

| ルール                                 | 理由                                |
| -------------------------------------- | ----------------------------------- |
| ✗ Page/Component が直接 API を呼ぶ     | UIロジックの責務がComponentに漏れる |
| ✗ Controller にビジネスロジックを書く  | テスト時にHTTPモックが必要になる    |
| ✗ Service が `req` / `res` を参照する  | HTTP層への結合。再利用性が失われる  |
| ✗ Repository にビジネスロジックを書く  | DBとロジックが密結合になる          |
| ✗ クライアントから直接DBに接続する     | セキュリティ・責務分離の崩壊        |
| ✗ クライアントがEntity型を直接参照する | DB内部表現がフロントに漏れる        |

### レイヤー責務サマリー

| レイヤー | クライアント (apps/client) | サーバー (apps/server)        | テスト手法                   |
| -------- | -------------------------- | ----------------------------- | ---------------------------- |
| 入口     | Page / Component (JSX)     | Route → Controller            | RTL / supertest              |
| ロジック | **Custom Hook**            | **Service**                   | renderHook / Vitest直接      |
| データ   | Service (API呼出)          | Repository (DB抽象)           | MSW / DBモック               |
| 純粋関数 | utils/                     | utils/                        | Vitest直接（最もテスト容易） |
| 型共有   | packages/types (DTO)       | packages/types (DTO + Entity) | —                            |

---

## ユニットテスト戦略

### テスト優先度（効率順）

| 優先度 | 対象                | テスト手法              | 理由                                 |
| ------ | ------------------- | ----------------------- | ------------------------------------ |
| 1      | 純粋関数 (`utils/`) | Vitest直接テスト        | 入出力のみ。最高効率でカバレッジ確保 |
| 2      | Server Service層    | Repositoryモック注入    | ビジネスロジックの核。HTTPモック不要 |
| 3      | Client Custom Hook  | `renderHook` + MSW      | UIロジックの検証。API層をモック      |
| 4      | Repository層        | テストDB / インメモリDB | DB操作の正確性検証                   |
| 5      | Controller層        | supertest               | HTTPステータス・レスポンス形式の検証 |
| 6      | Component層         | RTL (Testing Library)   | 振る舞いテスト。Hookモック可能       |

### テスト分離のポイント

```typescript
// ✅ Service層テスト例（HTTP非依存・DBモック注入）
describe('userService', () => {
  const mockUserRepo: IUserRepository = {
    findById: vi.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    // ...
  };

  it('should return user dto', async () => {
    const result = await userService.findById('1');
    expect(result.name).toBe('Test');
    expect(mockUserRepo.findById).toHaveBeenCalledWith('1');
  });
});

// ✅ Custom Hookテスト例（API層モック）
describe('useUserForm', () => {
  it('should load user on mount', async () => {
    // MSW でAPIモック設定済み
    const { result } = renderHook(() => useUserForm('1'));
    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
  });
});
```

---

## DB戦略

### DB使い分け方針

各機能でデータ特性に応じて MySQL / MongoDB / Redis を使い分ける。
Repository層で抽象化するため、Service層以上はDB種別を意識しない。

| DB      | 用途                                 | データ特性                           |
| ------- | ------------------------------------ | ------------------------------------ |
| MySQL   | マスターデータ、トランザクション処理 | リレーショナル、ACID保証が必要       |
| MongoDB | ドキュメント、ログ、柔軟なスキーマ   | 非構造化、ネスト構造、高頻度書き込み |
| Redis   | キャッシュ、セッション、一時データ   | 高速読み取り、TTL管理、揮発性OK      |

### 機能別DB選択例

```
ユーザー管理:
  └── MySQL   → users, roles, permissions（リレーショナル）
  └── Redis   → session, user preferences cache（高速参照）

ドキュメント管理:
  └── MongoDB → documents, revisions（柔軟なスキーマ）
  └── Redis   → document lock, edit session（一時的なロック管理）

アクティビティログ:
  └── MongoDB → activity_logs（高頻度書き込み、柔軟なペイロード）
```

### Repository抽象化パターン

```typescript
// Service層から見たDB操作（DB種別を意識しない）
const user = await userRepo.findById(id);         // 裏側: MySQL
const prefs = await prefsRepo.get(id);             // 裏側: Redis
const logs  = await activityRepo.findByUser(id);   // 裏側: MongoDB
```

> **重要**: Service層のコードにDB固有の記述（SQL文、Mongoクエリ、Redisコマンド等）が
> 現れてはならない。すべてRepository層に閉じ込める。
