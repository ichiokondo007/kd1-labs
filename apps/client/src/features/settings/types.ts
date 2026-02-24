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
  avatarColor: string;
  onUserNameChange: (value: string) => void;
  onAvatarColorChange: (color: string) => void;
  onSave: () => void;
  isSaving?: boolean;
  errorMessage?: string;
};

/** アバター色パレットの候補（hex） */
export const AVATAR_COLOR_PALETTE = [
  "#71717a", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899",
] as const;