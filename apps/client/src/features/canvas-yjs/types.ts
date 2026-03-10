import type { CanvasListItem } from "@kd1-labs/types";

export type { CanvasListItem };

export type CollabStatus = "ready" | "none";

export type YjsCanvasListItem = CanvasListItem & {
  collabStatus: CollabStatus;
  activeEditors: number;
};

export type YjsCanvasListViewModel = {
  items: YjsCanvasListItem[];
  isLoading: boolean;
  errorMessage?: string;
};
