export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** ログイン API リクエスト (POST /api/login) */
export interface LoginRequest {
  userId: string;
  password: string;
}

/** ログイン成功時にセッションに載せるユーザ情報 */
export interface UserInfo {
  userId: string;
  userName: string;
  isInitialPassword: number;
  isAdmin: number;
}

/** ログイン API レスポンス: 成功時 userInfo, 失敗時 null */
export interface LoginResponse {
  userInfo: UserInfo | null;
}
