/**
 * KD1 MongoDB Persistence
 *
 * bindState: MongoDB の Canvas JSON → Y.Doc に展開
 * writeState: Y.Doc → MongoDB に保存（全員退出時）
 */
import {
  findCanvasById,
  upsertCanvas,
  type CanvasDocument,
} from "@kd1-labs/document-db";
import type {
  Persistence,
  PersistenceWriteMeta,
  WSSharedDoc,
} from "../yjs/types.js";

// ── Fabric JSON の型定義（必要最小限） ────────────────────────────────

interface FabricObjectJson {
  type: string;
  left?: number;
  top?: number;
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

interface FabricCanvasJson {
  version?: string;
  objects?: FabricObjectJson[];
  backgroundImage?: Record<string, unknown>;
  [key: string]: unknown;
}

// ── CircleProps（クライアントの useYjsCircleSync と同じ構造） ─────────

interface CircleProps {
  left: number;
  top: number;
  radius: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  scaleX: number;
  scaleY: number;
  angle: number;
}

interface RectYjsProps {
  left: number;
  top: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  skewX: number;
  skewY: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
  visible: boolean;
}

// ── Canvas JSON → Y.Doc 展開 ─────────────────────────────────────────

function isCircleType(type: string): boolean {
  return type === "Circle" || type === "circle";
}

function isRectType(type: string): boolean {
  return type === "Rect" || type === "rect";
}

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

    const bgImage = fabricJson?.backgroundImage ?? null;
    const bgUrl = canvasDoc.backgroundImageUrl ?? null;
    if (bgImage) {
      yMeta.set("backgroundImage", bgImage);
    } else if (bgUrl) {
      yMeta.set("backgroundImage", bgUrl);
    } else {
      yMeta.set("backgroundImage", null);
    }

    if (!fabricJson?.objects) return;

    const yCircles = yDoc.getMap<CircleProps>("circles");
    const yRects = yDoc.getMap<RectYjsProps>("rects");
    const nonCircleObjects: FabricObjectJson[] = [];

    for (const obj of fabricJson.objects) {
      const id =
        typeof obj.yjsId === "string" ? obj.yjsId : crypto.randomUUID();

      if (isCircleType(String(obj.type))) {
        yCircles.set(id, {
          left: obj.left ?? 0,
          top: obj.top ?? 0,
          radius: obj.radius ?? 50,
          fill: typeof obj.fill === "string" ? obj.fill : "#e8f5e9",
          stroke: typeof obj.stroke === "string" ? obj.stroke : "#388e3c",
          strokeWidth: obj.strokeWidth ?? 2,
          scaleX: obj.scaleX ?? 1,
          scaleY: obj.scaleY ?? 1,
          angle: obj.angle ?? 0,
        });
      } else if (isRectType(String(obj.type))) {
        yRects.set(id, {
          left: obj.left ?? 0,
          top: obj.top ?? 0,
          width: obj.width ?? 120,
          height: obj.height ?? 80,
          fill: typeof obj.fill === "string" ? obj.fill : "#e3f2fd",
          stroke: typeof obj.stroke === "string" ? obj.stroke : "#1976d2",
          strokeWidth: obj.strokeWidth ?? 2,
          scaleX: obj.scaleX ?? 1,
          scaleY: obj.scaleY ?? 1,
          angle: obj.angle ?? 0,
          skewX: obj.skewX ?? 0,
          skewY: obj.skewY ?? 0,
          opacity: typeof obj.opacity === "number" ? obj.opacity : 1,
          flipX: Boolean(obj.flipX),
          flipY: Boolean(obj.flipY),
          visible: obj.visible !== false,
        });
      } else {
        nonCircleObjects.push(obj);
      }
    }

    if (nonCircleObjects.length > 0) {
      yMeta.set("nonCircleObjects", nonCircleObjects);
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
    backgroundImageUrl = bgRaw;
    backgroundImage = { type: "Image", src: bgRaw };
  } else if (bgRaw && typeof bgRaw === "object") {
    backgroundImage = bgRaw as Record<string, unknown>;
    backgroundImageUrl =
      typeof backgroundImage.src === "string" ? backgroundImage.src : null;
  }

  const objects: FabricObjectJson[] = [];

  const yCircles = yDoc.getMap<CircleProps>("circles");
  yCircles.forEach((props, id) => {
    objects.push({
      type: "Circle",
      yjsId: id,
      ...props,
    });
  });

  const yRects = yDoc.getMap<RectYjsProps>("rects");
  yRects.forEach((props, id) => {
    objects.push({
      type: "Rect",
      yjsId: id,
      ...props,
    });
  });

  const nonCircleObjects = yMeta.get("nonCircleObjects") as
    | FabricObjectJson[]
    | undefined;
  if (nonCircleObjects) {
    objects.push(...nonCircleObjects);
  }

  const canvas: FabricCanvasJson = {
    version: "6.6.1",
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
