import type { CanvasListItem } from "../types";
import { apiClient } from "@/services/apiClient";

/**
 * services は I/O のみ担当（fetch/axios/localStorage 等）
 * UI から直接呼ばず hooks 経由で利用する。
 */

export type SaveCanvasResult =
  | { ok: true; id: string; canvasName: string }
  | { ok: false; message: string };

export async function fetchCanvasItems(signal?: AbortSignal): Promise<CanvasListItem[]> {
  const res = await apiClient.get<{ success: boolean; data: CanvasListItem[] }>(
    "/api/canvas/items",
    { signal }
  );
  return res.data?.data ?? [];
}

export type CanvasDetail = {
  id: string;
  canvasName: string;
  canvas: unknown;
};

export async function fetchCanvas(id: string, signal?: AbortSignal): Promise<CanvasDetail> {
  const res = await apiClient.get<{ success: boolean; data: CanvasDetail }>(
    `/api/canvas/${id}`,
    { signal }
  );
  return res.data.data;
}

export async function saveCanvas(
  canvasName: string,
  canvas: unknown,
  id?: string,
  thumbnailUrl?: string,
): Promise<SaveCanvasResult> {
  try {
    const res = await apiClient.post<{
      success: true;
      data: { id: string; canvasName: string };
    }>("/api/canvas", { id, canvasName, canvas, thumbnailUrl });

    if (res.data?.success && res.data?.data?.id) {
      return { ok: true, id: res.data.data.id, canvasName: res.data.data.canvasName };
    }
    return { ok: false, message: "Unexpected response." };
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: { message?: string } } } };
    const message =
      err.response?.data?.error?.message ??
      (e instanceof Error ? e.message : "Failed to save canvas.");
    return { ok: false, message };
  }
}