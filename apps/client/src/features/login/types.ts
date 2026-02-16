// feature 内で閉じる型。外部共有が必要なら packages/types へ移す。

/** ログインフォームの送信データ */
export type LoginFormData = {
  userId: string;
  password: string;
};

/** サーバーから返るユーザー情報 */
export type UserInfo = {
  userId: string;
  userName: string;
  isInitialPassword: number;
  isAdmin: number;
};

/** POST /api/login のレスポンス */
export type LoginResponse = {
  data: UserInfo | null;
  error?: { code: string; message: string };
};

/** LoginPage（Presentational）の props */
export type LoginPageProps = {
  /** フォーム送信ハンドラ */
  onSubmit?: (data: LoginFormData) => void;
  /** 送信中フラグ（ボタン無効化に使用） */
  isSubmitting?: boolean;
  /** エラーメッセージ（認証失敗等） */
  errorMessage?: string;
};
