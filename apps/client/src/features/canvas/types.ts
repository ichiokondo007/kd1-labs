// feature 内で閉じる型。外部共有が必要なら packages/types へ移す。

export type CanvasItem = {
  id: string;
  title: string;
  createdAt: string; // ISO string
};

export type CanvasViewModel = {
  items: CanvasItem[];
  isLoading: boolean;
  errorMessage?: string;
};