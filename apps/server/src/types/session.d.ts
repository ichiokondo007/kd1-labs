/**
 * セッションに保存するユーザ情報（ログイン時 usecase が返す形に合わせる）
 */
export interface SessionUserInfo {
  userId: string;
  userName: string;
  screenName: string;
  isInitialPassword: boolean;
  isAdmin: boolean;
  /** プロフィール更新で設定。未設定時は GET /me でデフォルトを使用 */
  avatarColor?: string;
}

declare module "express-session" {
  interface SessionData {
    userInfo?: SessionUserInfo;
  }
}
