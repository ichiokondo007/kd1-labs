// feature 内で閉じる型。外部共有が必要なら packages/types へ移す。

export type UsersItem = {
  id: string;
  avatarUrl?: string | null;
  /** 画像がないときのアバター背景色（hex または Tailwind 名） */
  avatarColor?: string;
  userName: string;
  screenName: string;
  role: string;
};

export type UsersViewModel = {
  items: UsersItem[];
  isLoading: boolean;
  errorMessage?: string;
};

/** Presentational 用: 一覧表示 + アクションコールバック */
export type UsersPageProps = {
  items: UsersItem[];
  isLoading: boolean;
  errorMessage?: string;
  onCreateUser?: () => void;
  onPasswordReset?: (id: string) => void;
  onDelete?: (id: string) => void;
};
