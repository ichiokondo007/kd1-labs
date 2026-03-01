/**
 * ファイルアップロードユースケース
 * StoragePort にアップロードし、取得用 URL を返す。
 */
import type { StoragePort } from "../ports/storage.port";
import { ok, err, type Result } from "../lib/result";

export interface UploadFileInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export type UploadFileResult = Result<
  { url: string },
  { code: "UPLOAD_FAILED"; message: string }
>;

export function makeUploadFileUsecase(storage: StoragePort) {
  return async function uploadFileUsecase(
    input: UploadFileInput
  ): Promise<UploadFileResult> {
    try {
      const url = await storage.upload(input.key, input.body, input.contentType);
      return ok({ url });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed.";
      return err({ code: "UPLOAD_FAILED", message });
    }
  };
}
