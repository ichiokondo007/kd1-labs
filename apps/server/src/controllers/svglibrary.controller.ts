import type { Request, Response } from "express";
import {
  listSvgAssetsUsecase,
  uploadSvgAssetUsecase,
  removeSvgAssetUsecase,
} from "../composition/svglibrary.composition";
import { storagePort } from "../composition/storage.composition";

/**
 * SVG アセット一覧を返す。
 *
 * @route GET /api/svglibrary/items
 * @returns 200 { data: SvgAssetItem[] }
 * @returns 401 未ログイン
 * @returns 500 取得失敗
 */
export async function getSvglibraryItems(req: Request, res: Response) {
  if (!req.session?.userInfo) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const result = await listSvgAssetsUsecase();
  if (!result.ok) {
    res.status(500).json({ error: { code: result.error.code, message: result.error.message } });
    return;
  }

  const items = result.value.map((o) => ({
    key: o.key,
    url: o.url ? storagePort.buildPublicUrl(o.url) : "",
    title: extractTitle(o.key),
    createdAt: o.lastModified.toISOString(),
  }));

  res.status(200).json({ data: items });
}

/**
 * SVG ソースコードをアップロードして svg-assets/ に保存する。
 * Body: { title: string, svgSource: string }
 *
 * @route POST /api/svglibrary/upload
 * @returns 200 { success: true, data: { key: string, url: string } }
 * @returns 400 バリデーションエラー
 * @returns 401 未ログイン
 * @returns 500 アップロード失敗
 */
export async function postSvglibraryUpload(req: Request, res: Response) {
  if (!req.session?.userInfo) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const body = (req.body ?? {}) as { title?: string; svgSource?: string };
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const svgSource = typeof body.svgSource === "string" ? body.svgSource.trim() : "";

  if (!title) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "title is required." } });
    return;
  }
  if (!svgSource) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "svgSource is required." } });
    return;
  }
  if (!svgSource.includes("<svg")) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "svgSource must contain a valid <svg> element." } });
    return;
  }

  const result = await uploadSvgAssetUsecase(title, svgSource);
  if (!result.ok) {
    res.status(500).json({ error: { code: result.error.code, message: result.error.message } });
    return;
  }

  const data = {
    key: result.value.key,
    url: result.value.url ? storagePort.buildPublicUrl(result.value.url) : "",
  };
  res.status(200).json({ success: true, data });
}

/**
 * SVG アセットを削除する。
 *
 * @route DELETE /api/svglibrary/:key
 * @returns 200 { success: true }
 * @returns 400 バリデーションエラー
 * @returns 401 未ログイン
 * @returns 500 削除失敗
 */
export async function deleteSvglibraryItem(req: Request, res: Response) {
  if (!req.session?.userInfo) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const key = req.params.key;
  if (!key) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "key is required." } });
    return;
  }

  const fullKey = `svg-assets/${key}`;
  const result = await removeSvgAssetUsecase(fullKey);
  if (!result.ok) {
    res.status(500).json({ error: { code: result.error.code, message: result.error.message } });
    return;
  }

  res.status(200).json({ success: true });
}

/** オブジェクトキーからタイトルを抽出する（末尾の _xxxxxxxx.svg を除去） */
function extractTitle(key: string): string {
  const filename = key.split("/").pop() ?? key;
  return filename.replace(/_[a-f0-9]{8}\.svg$/, "").replace(/_/g, " ");
}
