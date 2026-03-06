import type { CanvasPort } from "../ports/canvas.port";

export type GetCanvasResult =
  | { ok: true; id: string; canvasName: string; canvas: unknown }
  | { ok: false; code: string; message: string };

export function makeGetCanvasUsecase(canvasPort: CanvasPort) {
  return async function getCanvasUsecase(id: string): Promise<GetCanvasResult> {
    if (!id) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Canvas ID is required." };
    }

    const row = await canvasPort.findById(id);
    if (!row) {
      return { ok: false, code: "NOT_FOUND", message: "Canvas not found." };
    }

    return { ok: true, id: row.id, canvasName: row.canvasName, canvas: row.canvas };
  };
}
