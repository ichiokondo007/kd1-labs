/**
 * 認証ポート
 * 認証ユーザー情報を取得する
 *
 * @param userId ユーザーID
 * @returns ユーザー情報
 */
export type AuthUserRecord = {
  userId: string;
  userName: string;
  passwordHash: string;
  isInitialPassword: 0 | 1;
  isAdmin: 0 | 1;
};

export interface AuthPort {
  findUserByUserId(userId: string): Promise<AuthUserRecord | null>;
}
