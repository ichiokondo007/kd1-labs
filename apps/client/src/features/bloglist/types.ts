// feature 内で閉じる型。外部共有が必要なら packages/types へ移す。

export type BlogCategory = {
  title: string;
  href: string;
};

export type BlogAuthor = {
  name: string;
  role: string;
  href: string;
  imageUrl: string;
};

export type BloglistItem = {
  id: string;
  title: string;
  href: string;
  description: string;
  imageUrl: string;
  date: string;
  datetime: string;
  category: BlogCategory;
  author: BlogAuthor;
  createdAt: string; // ISO string（ソート用）
};

export type BloglistViewModel = {
  items: BloglistItem[];
  isLoading: boolean;
  errorMessage?: string;
};