import { Canvas, type CanvasDocument } from "../models/canvas.model.js";

/**
 * ID で Canvas を 1 件取得する
 */
export async function findCanvasById(id: string): Promise<CanvasDocument | null> {
  return Canvas.findById(id).lean();
}

export type UpsertCanvasInput = {
  _id: string;
  canvasName: string;
  canvasDescription?: string | null;
  thumbnailUrl?: string | null;
  canvas: unknown;
  backgroundImageUrl?: string | null;
  updatedBy: string;
};

/**
 * Canvas を作成 or 更新する（upsert）
 */
export async function upsertCanvas(data: UpsertCanvasInput): Promise<CanvasDocument> {
  const doc = await Canvas.findOneAndUpdate(
    { _id: data._id },
    {
      canvasName: data.canvasName,
      canvasDescription: data.canvasDescription ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      canvas: data.canvas,
      backgroundImageUrl: data.backgroundImageUrl ?? null,
      updatedBy: data.updatedBy,
      updatedAt: new Date(),
    },
    { upsert: true, new: true, lean: true }
  );
  return doc as CanvasDocument;
}

export type CanvasSummary = {
  _id: string;
  canvasName: string;
  canvasDescription: string | null;
  thumbnailUrl: string | null;
  backgroundImageUrl: string | null;
  updatedBy: string;
  updatedAt: Date;
};

/**
 * Canvas 一覧を取得する（canvas 本体は除外、軽量）
 */
export async function listCanvases(): Promise<CanvasSummary[]> {
  return Canvas.find({}, { canvas: 0 }).lean() as Promise<CanvasSummary[]>;
}

/**
 * Canvas を削除する
 */
export async function deleteCanvas(id: string): Promise<boolean> {
  const result = await Canvas.deleteOne({ _id: id });
  return result.deletedCount > 0;
}
