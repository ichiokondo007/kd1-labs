import type { Request, Response } from "express";
import { uploadFileUsecase } from "../composition/storage.composition";

const MINIO_BASE =
  (process.env.MINIO_PUBLIC_URL_BASE ?? "").replace(/\/$/, "") ||
  `http://${process.env.MINIO_ENDPOINT ?? "localhost"}:${process.env.MINIO_PORT ?? "9000"}`;

const CONTENT_TYPE_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

function extensionFromContentType(contentType: string): string {
  const ext = CONTENT_TYPE_EXT[contentType.toLowerCase()];
  return ext ?? "bin";
}

function generateKey(prefix: string, contentType: string): string {
  const ext = extensionFromContentType(contentType);
  const uuid = crypto.randomUUID();
  return `${prefix}/${uuid}.${ext}`;
}

/**
 * ファイルアップロード（保存用）
 * Body: JSON { data: string (base64), contentType: string, key?: string }
 * key 未指定時は uploads/{uuid}.{ext} を生成。
 *
 * @route POST /api/storage/upload
 * @returns 200 { success: true, data: { url: string } }
 * @returns 400 バリデーションエラー
 * @returns 401 未ログイン
 * @returns 500 アップロード失敗
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

  res.status(200).json({ success: true, data: { url: result.value.url } });
}

/**
 * MinIO 画像を API 経由で返すプロキシ（CORS 回避）。
 * 許可するのは MINIO_PUBLIC_URL_BASE のみ。
 *
 * @route GET /api/storage/proxy?url=<encoded-url>
 * @returns 200 画像バイナリ（Content-Type は元レスポンスに従う）
 * @returns 400 url が未指定または許可外
 * @returns 502 上流取得失敗
 */
export async function getStorageProxy(req: Request, res: Response) {
  const rawUrl = typeof req.query.url === "string" ? req.query.url : "";
  const url = decodeURIComponent(rawUrl).trim();
  if (!url || !url.startsWith("http")) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "url is required and must be absolute." } });
    return;
  }
  if (!url.startsWith(MINIO_BASE)) {
    res.status(400).json({ error: { code: "FORBIDDEN_ORIGIN", message: "Proxy only allows MinIO URL." } });
    return;
  }
  try {
    const resp = await fetch(url, { method: "GET" });
    if (!resp.ok) {
      res.status(502).json({ error: { code: "UPSTREAM_ERROR", message: `MinIO returned ${resp.status}` } });
      return;
    }
    const contentType = resp.headers.get("content-type") ?? "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    const buf = Buffer.from(await resp.arrayBuffer());
    res.send(buf);
  } catch (err) {
    console.error("Storage proxy error:", err);
    res.status(502).json({ error: { code: "UPSTREAM_ERROR", message: "Failed to fetch from MinIO." } });
  }
}
