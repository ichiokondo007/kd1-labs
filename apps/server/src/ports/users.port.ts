/**
 * ユーザー一覧取得用ポート（DB アクセス抽象）
 * GET /api/users/items 用。
 */

export interface ListUserItem {
  userId: string;
  userName: string;
  screenName: string;
  isAdmin: boolean;
  avatarUrl: string | null;
  avatarColor: string;
}

export interface UsersPort {
  /** 一覧用ユーザー取得（password_hash は含めない） */
  listUsers(): Promise<ListUserItem[]>;
}
