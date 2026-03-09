import { apiClient } from "@/services/apiClient";
import type { SvgAssetItem } from "../types";

export async function fetchSvgAssets(signal?: AbortSignal): Promise<SvgAssetItem[]> {
  const res = await apiClient.get<{ data: SvgAssetItem[] }>("/api/svglibrary/items", { signal });
  return res.data.data ?? [];
}

export async function uploadSvgAsset(
  title: string,
  svgSource: string,
): Promise<{ key: string; url: string }> {
  const res = await apiClient.post<{ success: boolean; data: { key: string; url: string } }>(
    "/api/svglibrary/upload",
    { title, svgSource },
  );
  if (!res.data.success || !res.data.data) {
    throw new Error("Upload failed");
  }
  return res.data.data;
}

export async function deleteSvgAsset(key: string): Promise<void> {
  const filename = key.replace(/^svg-assets\//, "");
  await apiClient.delete(`/api/svglibrary/${encodeURIComponent(filename)}`);
}
