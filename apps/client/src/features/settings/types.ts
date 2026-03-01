// feature 内で閉じる型。外部共有が必要なら packages/types へ移す。

export type SettingsItem = {
  id: string;
  title: string;
  createdAt: string; // ISO string
};

export type SettingsViewModel = {
  items: SettingsItem[];
  isLoading: boolean;
  errorMessage?: string;
};

/** ユーザー情報変更フォーム用（Presentational の props）※パスワード変更は含まない */
export type SettingsPageFormProps = {
  userName: string;
  screenName: string;
  avatarColor: string;
  /** アバター画像 URL（dataURL 等）。ある場合は Avatar で画像表示 */
  avatarImageUrl?: string | null;
  /** アバター変更アイコン押下時（ファイル選択→クロップの開始を親で行う） */
  onAvatarChangeClick?: () => void;
  onUserNameChange: (value: string) => void;
  onScreenNameChange: (value: string) => void;
  onAvatarColorChange: (color: string) => void;
  /** Save 押下時。未アップロードのアバター（data URL）があれば渡すと DB に登録される */
  onSave: (pendingAvatarDataUrl?: string | null) => void | Promise<void>;
  /** Save 時に一緒に送るアバター画像（data URL）。クロップ済みで未保存のもの */
  pendingAvatarDataUrl?: string | null;
  /** Cancel 押下時（例: 前の画面へ） */
  onCancel?: () => void;
  /** Password Reset 押下時（例: パスワード変更画面へ） */
  onPasswordReset?: () => void;
  isSaving?: boolean;
  /** ユーザー名のバリデーションエラー */
  userNameError?: string;
  /** NickName（Screen Name）のバリデーションエラー */
  screenNameError?: string;
  /** サーバーエラー等 */
  errorMessage?: string;
};

/** useSettingsForm の戻り値（Presentational に渡す props + ページ用の avatarUrl / saveAvatarUrl） */
export type SettingsPageFormHookResult = SettingsPageFormProps & {
  isLoading: boolean;
  /** サーバーに保存されているアバター画像 URL */
  avatarUrl: string | null;
  /** アップロード後の URL をプロフィールに保存する */
  saveAvatarUrl: (url: string) => Promise<void>;
};

/** アバター色パレットの候補（hex） */
export const AVATAR_COLOR_PALETTE = [
  "#71717a", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899",
] as const;