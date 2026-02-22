/**
 * セッションに保存するユーザ情報（ログイン時 usecase が返す形に合わせる）
 */
export interface SessionUserInfo {
  userId: string;
  userName: string;
  isInitialPassword: boolean;
  isAdmin: boolean;
}

declare module "express-session" {
  interface SessionData {
    userInfo?: SessionUserInfo;
  }
}
