/**
 * SVG Library ユースケース
 * svg-assets/ プレフィックス配下のオブジェクト一覧取得・アップロード・削除を行う。
 */
import type { StoragePort } from "../ports/storage.port";
import { ok, err, type Result } from "../lib/result";

const SVG_PREFIX = "svg-assets/";

export interface SvgAssetObject {
  key: string;
  url: string;
  lastModified: Date;
}

export type ListSvgAssetsResult = Result<
  SvgAssetObject[],
  { code: "LIST_FAILED"; message: string }
>;

export type UploadSvgAssetResult = Result<
  { key: string; url: string },
  { code: "UPLOAD_FAILED"; message: string }
>;

export type RemoveSvgAssetResult = Result<
  void,
  { code: "REMOVE_FAILED"; message: string }
>;

export function makeListSvgAssetsUsecase(
  storage: StoragePort,
  buildUrl: (key: string) => string,
) {
  return async function listSvgAssets(): Promise<ListSvgAssetsResult> {
    try {
      const objects = await storage.list(SVG_PREFIX);
      const items = objects.map((o) => ({
        key: o.key,
        url: buildUrl(o.key),
        lastModified: o.lastModified,
      }));
      return ok(items);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to list SVG assets.";
      return err({ code: "LIST_FAILED", message });
    }
  };
}

export function makeUploadSvgAssetUsecase(storage: StoragePort, buildUrl: (key: string) => string) {
  return async function uploadSvgAsset(
    title: string,
    svgSource: string,
  ): Promise<UploadSvgAssetResult> {
    try {
      const safeName = title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
      const key = `${SVG_PREFIX}${safeName}_${crypto.randomUUID().slice(0, 8)}.svg`;
      const buffer = Buffer.from(svgSource, "utf-8");
      await storage.upload(key, buffer, "image/svg+xml");
      return ok({ key, url: buildUrl(key) });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to upload SVG asset.";
      return err({ code: "UPLOAD_FAILED", message });
    }
  };
}

export function makeRemoveSvgAssetUsecase(storage: StoragePort) {
  return async function removeSvgAsset(key: string): Promise<RemoveSvgAssetResult> {
    try {
      if (!key.startsWith(SVG_PREFIX)) {
        return err({ code: "REMOVE_FAILED", message: "Invalid key: must start with svg-assets/." });
      }
      await storage.remove(key);
      return ok(undefined);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to remove SVG asset.";
      return err({ code: "REMOVE_FAILED", message });
    }
  };
}
