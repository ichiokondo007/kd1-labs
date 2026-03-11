import { apiClient } from "./apiClient";

export interface UploadStorageResponse {
  success: boolean;
  data: { key: string; url: string };
}

export interface UploadResult {
  /** DB 保存用のオブジェクトキー（例: uploads/xxx.jpg） */
  key: string;
  /** ブラウザ表示用の完全 URL（例: http://localhost:9000/public/uploads/xxx.jpg） */
  url: string;
}

/**
 * dataURL または base64 文字列をアップロードする。
 * @returns { key, url } — DB 保存には key、画面表示には url を使う
 */
export async function uploadFile(
  dataUrlOrBase64: string,
  contentType: string,
  key?: string
): Promise<UploadResult> {
  const base64 = dataUrlOrBase64.replace(/^data:[^;]+;base64,/, "");
  const res = await apiClient.post<UploadStorageResponse>("/api/storage/upload", {
    data: base64,
    contentType,
    ...(key && { key }),
  });
  if (!res.data.success || !res.data.data?.key) {
    throw new Error("Upload failed");
  }
  return { key: res.data.data.key, url: res.data.data.url };
}
