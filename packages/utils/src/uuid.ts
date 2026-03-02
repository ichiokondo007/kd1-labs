
import { v7 as uuidv7 } from 'uuid';

// UUID v7 の生成
export function generateUUIDv7(): string {
  return uuidv7();
}


export function getUUIDv7FromDate(date: Date): string {
  return uuidv7({ msecs: date.getTime() });
}

/**
 * UUID v7 から埋め込みタイムスタンプ（先頭48bit）を抽出して Date を返す。
 */
export function getDateFromUUIDv7(uuid: string): Date {
  const parts = uuid.split("-");
  const highBitsHex = parts[0] + parts[1].slice(0, 4);
  const timestampMs = Number.parseInt(highBitsHex, 16);
  return new Date(timestampMs);
}