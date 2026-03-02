import { describe, expect, it } from "vitest";
import {
  generateUUIDv7,
  getDateFromUUIDv7,
  getUUIDv7FromDate,
} from "./uuid.js";

describe("uuid", () => {
  it("generateUUIDv7 で生成した UUID から getDateFromUUIDv7 で時間を取得し LOG に出す", () => {
    const id = generateUUIDv7();
    const date = getDateFromUUIDv7(id);

    // テスト用に時間を LOG 出力
    console.log("Generated UUID:", id);
    console.log("Extracted date from UUID v7:", date.toISOString());

    // 生成直後なので、抽出した日時は「今」の前後 1 秒以内であること
    const now = Date.now();
    const extractedMs = date.getTime();
    expect(Math.abs(extractedMs - now)).toBeLessThan(1000);
  });

  it("getUUIDv7FromDate で指定した日時が UUID に含まれる", () => {
    const fixed = new Date("2025-03-02T12:00:00.000Z");
    const id = getUUIDv7FromDate(fixed);
    const extracted = getDateFromUUIDv7(id);

    console.log("Fixed date:", fixed.toISOString());
    console.log("UUID from date:", id);
    console.log("Extracted date:", extracted.toISOString());

    expect(extracted.getTime()).toBe(fixed.getTime());
  });
});
