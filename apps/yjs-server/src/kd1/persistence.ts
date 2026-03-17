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
import type { Persistence, WSSharedDoc } from "../yjs/types.js";

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

// ── Canvas JSON → Y.Doc 展開 ─────────────────────────────────────────

function isCircleType(type: string): boolean {
  return type === "Circle" || type === "circle";
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
    const nonCircleObjects: FabricObjectJson[] = [];

    for (const obj of fabricJson.objects) {
      const id =
        typeof obj.yjsId === "string" ? obj.yjsId : crypto.randomUUID();

      if (isCircleType(obj.type)) {
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

    async writeState(docName: string, doc: WSSharedDoc): Promise<void> {
      const data = collapseYDocToCanvasJson(doc);
      await upsertCanvas({
        _id: docName,
        canvasName: data.canvasName,
        canvasDescription: data.canvasDescription,
        thumbnailUrl: data.thumbnailUrl,
        canvas: data.canvas,
        backgroundImageUrl: data.backgroundImageUrl,
        updatedBy: "yjs-server",
      });
      console.log(`[kd1:persistence:write] "${docName}" — saved to MongoDB`);
    },
  };
}
