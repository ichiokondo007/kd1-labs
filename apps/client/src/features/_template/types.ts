// feature 内で閉じる型。外部共有が必要なら packages/types へ移す。

export type TemplateItem = {
  id: string;
  title: string;
  createdAt: string; // ISO string
};

export type TemplateViewModel = {
  items: TemplateItem[];
  isLoading: boolean;
  errorMessage?: string;
};