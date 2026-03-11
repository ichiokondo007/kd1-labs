import type { CanvasPort } from "../ports/canvas.port";

export type DeleteCanvasUsecaseResult =
  | { ok: true }
  | { ok: false; code: "VALIDATION_ERROR" | "NOT_FOUND"; message: string };

export function makeDeleteCanvasUsecase(canvasPort: CanvasPort) {
  return async function deleteCanvasUsecase(id: string): Promise<DeleteCanvasUsecaseResult> {
    const trimmedId = id.trim();
    if (!trimmedId) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Canvas ID is required." };
    }

    const deleted = await canvasPort.deleteCanvas(trimmedId);
    if (!deleted) {
      return { ok: false, code: "NOT_FOUND", message: "Canvas not found." };
    }

    return { ok: true };
  };
}

