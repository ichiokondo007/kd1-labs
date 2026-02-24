// feature 内で閉じる型。外部共有が必要なら packages/types へ移す。

/** パスワード変更フォーム用（Presentational の props） */
export type PasswordChangePageFormProps = {
  userName: string;
  newPassword: string;
  confirmPassword: string;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSave: () => void;
  isSaving?: boolean;
  errorMessage?: string;
};

export type PasswordChangeItem = {
  id: string;
  title: string;
  createdAt: string; // ISO string
};

export type PasswordChangeViewModel = {
  items: PasswordChangeItem[];
  isLoading: boolean;
  errorMessage?: string;
};