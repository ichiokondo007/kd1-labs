/**
 * 認証ポート
 * user_name でユーザーを検索し、パスワード照合用のレコードを返す
 *
 * @param userName ログイン名（user_name 一意）
 * @returns ユーザー情報（照合用）
 */
export type AuthUserRecord = {
  userId: string;
  userName: string;
  screenName: string;
  passwordHash: string;
  isInitialPassword: boolean;
  isAdmin: boolean;
  /** アバター画像 URL（users.avatar_url） */
  avatarUrl: string | null;
  /** アバター背景色（users.avatar_color） */
  avatarColor: string;
};

export interface AuthPort {
  findUserByUserName(userName: string): Promise<AuthUserRecord | null>;
}
