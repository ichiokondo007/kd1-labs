import type { Request, Response } from "express";
import { uploadFileUsecase, storagePort } from "../composition/storage.composition";

const CONTENT_TYPE_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

function extensionFromContentType(contentType: string): string {
  return CONTENT_TYPE_EXT[contentType.toLowerCase()] ?? "bin";
}

function generateKey(prefix: string, contentType: string): string {
  const ext = extensionFromContentType(contentType);
  const uuid = crypto.randomUUID();
  return `${prefix}/${uuid}.${ext}`;
}

/**
 * ファイルアップロード
 * Body: JSON { data: string (base64), contentType: string, key?: string }
 * key 未指定時は uploads/{uuid}.{ext} を生成。
 *
 * @route POST /api/storage/upload
 * @returns 200 { success: true, data: { key: string, url: string } }
 */
export async function postStorageUpload(req: Request, res: Response) {
  const sessionUser = req.session?.userInfo;
  if (!sessionUser) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const body = (req.body ?? {}) as { data?: string; contentType?: string; key?: string };
  const data = typeof body.data === "string" ? body.data : "";
  const contentType = typeof body.contentType === "string" ? body.contentType.trim() : "";
  const keyProvided = typeof body.key === "string" ? body.key.trim() : null;

  if (!data || !contentType) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "data and contentType are required." },
    });
    return;
  }

  let buffer: Buffer;
  try {
    const base64 = data.replace(/^data:[^;]+;base64,/, "");
    buffer = Buffer.from(base64, "base64");
  } catch {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "data must be valid base64." },
    });
    return;
  }

  if (buffer.length === 0) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: "data must not be empty." },
    });
    return;
  }

  const key = keyProvided ?? generateKey("uploads", contentType);
  const result = await uploadFileUsecase({ key, body: buffer, contentType });

  if (!result.ok) {
    res.status(500).json({
      error: { code: result.error.code, message: result.error.message },
    });
    return;
  }

  const url = storagePort.buildPublicUrl(result.value.key);
  res.status(200).json({ success: true, data: { key: result.value.key, url } });
}
