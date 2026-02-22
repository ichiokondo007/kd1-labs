// feature 内で閉じる型。DTO は packages/types を SSOT とする。

import type { LoginResponse, UserInfo } from "@kd1-labs/types";

/** ログインフォームの送信データ（userName でログイン） */
export type LoginFormData = {
  userName: string;
  password: string;
};

// UserInfo, LoginResponse は @kd1-labs/types から利用
export type { LoginResponse, UserInfo };

/** LoginPage（Presentational）の props */
export type LoginPageProps = {
  /** フォーム送信ハンドラ */
  onSubmit?: (data: LoginFormData) => void;
  /** 送信中フラグ（ボタン無効化に使用） */
  isSubmitting?: boolean;
  /** エラーメッセージ（認証失敗等） */
  errorMessage?: string;
};
