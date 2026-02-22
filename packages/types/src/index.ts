/** users テーブル由来のユーザー情報（API 応答用。passwordHash は含めない） */
export interface User {
  userId: string;
  userName: string;
  isAdmin: boolean;
  isInitialPassword: boolean;
  avatarUrl: string | null;
  avatarColor: string;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** ログイン API リクエスト (POST /api/login)。user_name で認証する */
export interface LoginRequest {
  userName: string;
  password: string;
}

/** ログイン成功時にセッションに載せるユーザ情報 */
export interface UserInfo {
  userId: string;
  userName: string;
  isInitialPassword: boolean;
  isAdmin: boolean;
  avatarUrl: string | null;
  avatarColor: string;
}

/** ログイン API レスポンス: 成功時 userInfo, 失敗時 null（401 時は error で理由を返すことがある） */
export interface LoginResponse {
  userInfo: UserInfo | null;
  error?: { message: string };
}
