import mongoose from "mongoose";
import { getMongoUri } from "./config.js";

/**
 * MongoDB に接続する。アプリ起動時に呼び出す。
 */
export async function connectMongo(): Promise<typeof mongoose> {
  const uri = getMongoUri();
  return mongoose.connect(uri);
}

/**
 * MongoDB から切断する。アプリ終了時に呼び出す。
 */
export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
