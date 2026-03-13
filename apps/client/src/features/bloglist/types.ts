// feature 内で閉じる型。外部共有が必要なら packages/types へ移す。

export type BlogCategory = {
  title: string;
};

export type BlogAuthor = {
  name: string;
  role: string;
};

export type BloglistItem = {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  datetime: string;
  category: BlogCategory;
  author: BlogAuthor;
};

export type BloglistViewModel = {
  items: BloglistItem[];
  isLoading: boolean;
  errorMessage?: string;
};