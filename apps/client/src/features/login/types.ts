// feature 内で閉じる型。外部共有が必要なら packages/types へ移す。

export type LoginItem = {
  id: string;
  title: string;
  createdAt: string; // ISO string
};

export type LoginViewModel = {
  items: LoginItem[];
  isLoading: boolean;
  errorMessage?: string;
};