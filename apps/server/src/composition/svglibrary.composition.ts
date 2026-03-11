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

function buildKey(key: string): string {
  return key;
}

export const listSvgAssetsUsecase = makeListSvgAssetsUsecase(storagePort, buildKey);
export const uploadSvgAssetUsecase = makeUploadSvgAssetUsecase(storagePort, buildKey);
export const removeSvgAssetUsecase = makeRemoveSvgAssetUsecase(storagePort);
