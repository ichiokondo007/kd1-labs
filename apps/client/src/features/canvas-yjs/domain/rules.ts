import type { CollabStatus } from "../types";

export function collabStatusLabel(
  status: CollabStatus,
  activeEditors: number,
): string {
  if (status === "ready") {
    return activeEditors > 0 ? `Editing (${activeEditors})` : "Ready";
  }
  return "";
}
