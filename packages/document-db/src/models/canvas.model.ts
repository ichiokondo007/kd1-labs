import { Schema, model, type InferSchemaType } from "mongoose";

const canvasSchema = new Schema(
  {
    _id: { type: String, required: true },
    canvasName: { type: String, required: true },
    canvasDescription: { type: String, default: null },
    thumbnailUrl: { type: String, default: null },
    canvas: { type: Schema.Types.Mixed, required: true },
    backgroundImageUrl: { type: String, default: null },
    updatedBy: { type: String, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    collection: "canvases",
    timestamps: false,
    _id: false,
  }
);

export type CanvasDocument = InferSchemaType<typeof canvasSchema> & { _id: string };

export const Canvas = model("Canvas", canvasSchema);
