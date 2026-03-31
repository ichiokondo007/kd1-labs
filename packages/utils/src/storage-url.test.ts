import { describe, expect, it } from "vitest";
import { buildStorageUrl, extractStorageKey } from "./storage-url";

describe("buildStorageUrl", () => {
  it("key からブラウザ向け相対パスを組み立てる", () => {
    expect(buildStorageUrl("public", "uploads/xxx.jpg")).toBe(
      "/storage/public/uploads/xxx.jpg",
    );
  });

  it("http:// で始まるキーはそのまま返す", () => {
    const url = "http://localhost:9000/public/uploads/xxx.jpg";
    expect(buildStorageUrl("public", url)).toBe(url);
  });

  it("https:// で始まるキーはそのまま返す", () => {
    const url = "https://kd1-tech.net/storage/public/uploads/xxx.jpg";
    expect(buildStorageUrl("public", url)).toBe(url);
  });

  it("/storage/ で始まるキーはそのまま返す", () => {
    const path = "/storage/public/uploads/xxx.jpg";
    expect(buildStorageUrl("public", path)).toBe(path);
  });

  it("/api/ で始まるキーはそのまま返す", () => {
    const path = "/api/storage/upload";
    expect(buildStorageUrl("public", path)).toBe(path);
  });
});

describe("extractStorageKey", () => {
  it("ドメイン付きフルURLからキーを抽出する", () => {
    expect(
      extractStorageKey(
        "https://kd1-tech.net/storage/public/uploads/xxx.jpg",
      ),
    ).toBe("uploads/xxx.jpg");
  });

  it("相対パスからキーを抽出する", () => {
    expect(extractStorageKey("/storage/public/uploads/xxx.jpg")).toBe(
      "uploads/xxx.jpg",
    );
  });

  it("既にキーのみの場合はそのまま返す", () => {
    expect(extractStorageKey("uploads/xxx.jpg")).toBe("uploads/xxx.jpg");
  });

  it("異なる bucket でも正しく抽出する", () => {
    expect(extractStorageKey("/storage/private/docs/file.pdf")).toBe(
      "docs/file.pdf",
    );
  });

  it("http:// ドメインからも抽出できる", () => {
    expect(
      extractStorageKey("http://localhost/storage/public/uploads/xxx.jpg"),
    ).toBe("uploads/xxx.jpg");
  });

  it("不正な URL はそのまま返す", () => {
    expect(extractStorageKey("not-a-url")).toBe("not-a-url");
  });

  it("サブディレクトリを含むキーも正しく抽出する", () => {
    expect(
      extractStorageKey(
        "https://example.com/storage/public/uploads/2024/01/image.jpg",
      ),
    ).toBe("uploads/2024/01/image.jpg");
  });
});
