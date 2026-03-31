import {
  upsertCanvas as dbUpsertCanvas,
  listCanvases as dbListCanvases,
  findCanvasById as dbFindCanvasById,
  deleteCanvas as dbDeleteCanvas,
} from "@kd1-labs/document-db";
import { generateUUIDv7, extractStorageKey } from "@kd1-labs/utils";
import type {
  CanvasPort,
  CanvasDetailRow,
  CanvasSummaryRow,
  UpsertCanvasInput,
  UpsertCanvasOutput,
} from "../ports/canvas.port";

function extractBgKeyFromCanvas(canvas: unknown): string | null {
  if (!canvas || typeof canvas !== "object") return null;
  const c = canvas as Record<string, unknown>;
  if (!c.backgroundImage || typeof c.backgroundImage !== "object") return null;
  const bg = c.backgroundImage as Record<string, unknown>;
  if (typeof bg.src === "string") return extractStorageKey(bg.src);
  return null;
}

export const canvasDocumentDbAdapter: CanvasPort = {
  async upsertCanvas(data: UpsertCanvasInput): Promise<UpsertCanvasOutput> {
    const id = data.id ?? generateUUIDv7();
    const backgroundImageUrl = extractBgKeyFromCanvas(data.canvas);
    const doc = await dbUpsertCanvas({
      _id: id,
      canvasName: data.canvasName,
      canvasDescription: null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      canvas: data.canvas,
      backgroundImageUrl,
      updatedBy: data.updatedBy,
    });
    return { id: doc._id, canvasName: doc.canvasName };
  },

  async listCanvases(): Promise<CanvasSummaryRow[]> {
    const docs = await dbListCanvases();
    return docs.map((d) => ({
      id: d._id,
      canvasName: d.canvasName,
      canvasDescription: d.canvasDescription,
      thumbnailUrl: d.thumbnailUrl,
      updatedBy: d.updatedBy,
      updatedAt: d.updatedAt,
    }));
  },

  async findById(id: string): Promise<CanvasDetailRow | null> {
    const doc = await dbFindCanvasById(id);
    if (!doc) return null;
    return {
      id: doc._id,
      canvasName: doc.canvasName,
      canvas: doc.canvas,
    };
  },

  async deleteCanvas(id: string): Promise<boolean> {
    return dbDeleteCanvas(id);
  },
};
