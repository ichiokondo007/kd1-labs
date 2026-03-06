import type { CanvasListItem } from "@kd1-labs/types";

export type { CanvasListItem };

export type CanvasListViewModel = {
  items: CanvasListItem[];
  isLoading: boolean;
  errorMessage?: string;
};