/**
 * SVG Library コンポジション
 * storagePort を使って svglibrary 用 usecase を組み立てる。
 */
import { storagePort } from "./storage.composition";
import {
  makeListSvgAssetsUsecase,
  makeUploadSvgAssetUsecase,
  makeRemoveSvgAssetUsecase,
} from "../usecases/svglibrary.usecase";

const MINIO_BASE =
  (process.env.MINIO_PUBLIC_URL_BASE ?? "").replace(/\/$/, "") ||
  `http://${process.env.MINIO_ENDPOINT ?? "localhost"}:${process.env.MINIO_PORT ?? "9000"}`;
const BUCKET = process.env.MINIO_BUCKET ?? "public";

function buildPublicUrl(key: string): string {
  return `${MINIO_BASE}/${BUCKET}/${key}`;
}

export const listSvgAssetsUsecase = makeListSvgAssetsUsecase(storagePort, buildPublicUrl);
export const uploadSvgAssetUsecase = makeUploadSvgAssetUsecase(storagePort, buildPublicUrl);
export const removeSvgAssetUsecase = makeRemoveSvgAssetUsecase(storagePort);
