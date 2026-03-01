/**
 * ファイル保存用コンポジション（MinIO / S3 等の切り替え）
 * 環境変数 STORAGE_PROVIDER で minio | s3 を指定。未指定時は minio。
 */
import { createMinioStorageAdapter } from "../adapters/storage.minio";
import { createS3StorageAdapter } from "../adapters/storage.s3";
import { makeUploadFileUsecase } from "../usecases/upload-file.usecase";

const PROVIDER = process.env.STORAGE_PROVIDER ?? "minio";

function createStoragePort() {
  if (PROVIDER === "s3") {
    return createS3StorageAdapter({
      region: process.env.AWS_REGION ?? "",
      bucket: process.env.AWS_S3_BUCKET ?? "",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    });
  }
  // 既定: MinIO（docker-compose の kd1-minio 想定）。署名なし・有効期限なしの公開 URL を返す。
  return createMinioStorageAdapter({
    endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
    port: Number(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY ?? "kd1admin",
    secretKey: process.env.MINIO_SECRET_KEY ?? "kd1admin1234",
    bucket: process.env.MINIO_BUCKET ?? "public",
    publicUrlBase: process.env.MINIO_PUBLIC_URL_BASE,
  });
}

const storagePort = createStoragePort();
export const uploadFileUsecase = makeUploadFileUsecase(storagePort);
