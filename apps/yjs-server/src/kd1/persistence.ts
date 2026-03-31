/**
 * KD1 MongoDB Persistence
 *
 * bindState: MongoDB の Canvas JSON → Y.Doc に展開
 * writeState: Y.Doc → MongoDB に保存（全員退出時）
 *
 * 全オブジェクトを単一の Y.Map("objects") で管理し、
 * fabricSnapshot (toObject() の完全 JSON) で統一的に扱う。
 */
import {
  findCanvasById,
  upsertCanvas,
  type CanvasDocument,
} from "@kd1-labs/document-db";
import { buildStorageUrl, extractStorageKey } from "@kd1-labs/utils";
import type {
  Persistence,
  PersistenceWriteMeta,
  WSSharedDoc,
} from "../yjs/types.js";

const STORAGE_BUCKET = process.env.MINIO_BUCKET ?? "public";

// ── Fabric JSON の型定義（必要最小限） ────────────────────────────────

interface FabricObjectJson {
  type: string;
  [key: string]: unknown;
}

interface FabricCanvasJson {
  version?: string;
  objects?: FabricObjectJson[];
  backgroundImage?: Record<string, unknown>;
  [key: string]: unknown;
}

// ── Y.Map エントリ型 ─────────────────────────────────────────────────

interface ObjectYjsEntry {
  fabricSnapshot: Record<string, unknown>;
}

// ── Y.js 内部型を plain object に変換 ────────────────────────────────

function toPlainObject(value: unknown): unknown {
  if (value == null) return value;
  if (
    typeof value === "object" &&
    "toJSON" in value &&
    typeof (value as { toJSON: unknown }).toJSON === "function"
  ) {
    return (value as { toJSON: () => unknown }).toJSON();
  }
  return value;
}

// ── Canvas JSON → Y.Doc 展開 ─────────────────────────────────────────

function expandCanvasToYDoc(
  canvasDoc: CanvasDocument,
  yDoc: WSSharedDoc,
): void {
  const fabricJson = canvasDoc.canvas as FabricCanvasJson | null;

  yDoc.transact(() => {
    const yMeta = yDoc.getMap("meta");
    yMeta.set("canvasName", canvasDoc.canvasName);
    yMeta.set("canvasDescription", canvasDoc.canvasDescription ?? null);
    yMeta.set("thumbnailUrl", canvasDoc.thumbnailUrl ?? null);

    const bgKey = canvasDoc.backgroundImageUrl ?? null;
    const bgImage = fabricJson?.backgroundImage ?? null;
    if (bgKey) {
      const src = buildStorageUrl(STORAGE_BUCKET, bgKey);
      if (bgImage) {
        yMeta.set("backgroundImage", { ...bgImage, key: bgKey, src });
      } else {
        yMeta.set("backgroundImage", { type: "Image", key: bgKey, src });
      }
    } else if (bgImage) {
      yMeta.set("backgroundImage", bgImage);
    } else {
      yMeta.set("backgroundImage", null);
    }

    if (!fabricJson?.objects) return;

    const yObjects = yDoc.getMap<ObjectYjsEntry>("objects");

    for (const obj of fabricJson.objects) {
      const id =
        typeof obj.yjsId === "string" ? obj.yjsId : crypto.randomUUID();
      yObjects.set(id, {
        fabricSnapshot: obj as Record<string, unknown>,
      });
    }
  });
}

// ── Y.Doc → Canvas JSON 逆変換 ──────────────────────────────────────

function collapseYDocToCanvasJson(yDoc: WSSharedDoc): {
  canvasName: string;
  canvasDescription: string | null;
  thumbnailUrl: string | null;
  backgroundImageUrl: string | null;
  canvas: FabricCanvasJson;
} {
  const yMeta = yDoc.getMap("meta");
  const canvasName = (yMeta.get("canvasName") as string) ?? "Untitled";
  const canvasDescription =
    (yMeta.get("canvasDescription") as string | null) ?? null;
  const thumbnailUrl = (yMeta.get("thumbnailUrl") as string | null) ?? null;

  const bgRaw = yMeta.get("backgroundImage");
  let backgroundImageUrl: string | null = null;
  let backgroundImage: Record<string, unknown> | undefined;

  if (typeof bgRaw === "string") {
    backgroundImageUrl = extractStorageKey(bgRaw);
    backgroundImage = {
      type: "Image",
      src: buildStorageUrl(STORAGE_BUCKET, backgroundImageUrl),
    };
  } else if (bgRaw && typeof bgRaw === "object") {
    backgroundImage = bgRaw as Record<string, unknown>;
    if (typeof backgroundImage.key === "string") {
      backgroundImageUrl = backgroundImage.key;
    } else if (typeof backgroundImage.src === "string") {
      backgroundImageUrl = extractStorageKey(backgroundImage.src);
    }
    if (backgroundImageUrl) {
      backgroundImage = {
        ...backgroundImage,
        key: backgroundImageUrl,
        src: buildStorageUrl(STORAGE_BUCKET, backgroundImageUrl),
      };
    }
  }

  const objects: FabricObjectJson[] = [];

  const yObjects = yDoc.getMap<ObjectYjsEntry>("objects");
  yObjects.forEach((entry, id) => {
    const plain = toPlainObject(entry.fabricSnapshot);
    const obj = { ...(plain as Record<string, unknown>) } as FabricObjectJson;
    obj.yjsId = id;
    objects.push(obj);
  });

  const canvas: FabricCanvasJson = {
    version: "7.2.0",
    objects,
    ...(backgroundImage ? { backgroundImage } : {}),
  };

  return {
    canvasName,
    canvasDescription,
    thumbnailUrl,
    backgroundImageUrl,
    canvas,
  };
}

// ── Persistence factory ──────────────────────────────────────────────

export function createMongoPersistence(): Persistence {
  return {
    async bindState(docName: string, doc: WSSharedDoc): Promise<void> {
      const canvasDoc = await findCanvasById(docName);
      if (!canvasDoc) {
        console.log(
          `[kd1:persistence:bind] "${docName}" — not found in MongoDB, starting empty`,
        );
        return;
      }
      expandCanvasToYDoc(canvasDoc, doc);
      console.log(
        `[kd1:persistence:bind] "${docName}" — loaded from MongoDB (${
          (canvasDoc.canvas as FabricCanvasJson)?.objects?.length ?? 0
        } objects)`,
      );
    },

    async writeState(
      docName: string,
      doc: WSSharedDoc,
      meta?: PersistenceWriteMeta,
    ): Promise<void> {
      const data = collapseYDocToCanvasJson(doc);
      let updatedBy = meta?.updatedBy;
      let updatedBySource: "awareness" | "db" | "fallback" = "awareness";
      if (updatedBy === undefined || updatedBy.length === 0) {
        const existing = await findCanvasById(docName);
        if (existing?.updatedBy) {
          updatedBy = existing.updatedBy;
          updatedBySource = "db";
        } else {
          updatedBy = "yjs-server";
          updatedBySource = "fallback";
        }
      }
      await upsertCanvas({
        _id: docName,
        canvasName: data.canvasName,
        canvasDescription: data.canvasDescription,
        thumbnailUrl: data.thumbnailUrl,
        canvas: data.canvas,
        backgroundImageUrl: data.backgroundImageUrl,
        updatedBy,
      });
      console.log(
        `[kd1:persistence:write] "${docName}" — saved to MongoDB (updatedBy="${updatedBy}" source=${updatedBySource})`,
      );
    },
  };
}
