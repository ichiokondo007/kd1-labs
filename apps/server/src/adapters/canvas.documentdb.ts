import {
  upsertCanvas as dbUpsertCanvas,
  listCanvases as dbListCanvases,
  findCanvasById as dbFindCanvasById,
} from "@kd1-labs/document-db";
import { generateUUIDv7 } from "@kd1-labs/utils";
import type {
  CanvasPort,
  CanvasDetailRow,
  CanvasSummaryRow,
  UpsertCanvasInput,
  UpsertCanvasOutput,
} from "../ports/canvas.port";

export const canvasDocumentDbAdapter: CanvasPort = {
  async upsertCanvas(data: UpsertCanvasInput): Promise<UpsertCanvasOutput> {
    const id = data.id ?? generateUUIDv7();
    const doc = await dbUpsertCanvas({
      _id: id,
      canvasName: data.canvasName,
      canvasDescription: null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      canvas: data.canvas,
      backgroundImageUrl: null,
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
};
