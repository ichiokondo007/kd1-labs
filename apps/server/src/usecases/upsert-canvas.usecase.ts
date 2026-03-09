/**
 * Canvas 作成/更新ユースケース
 * Port 経由で MongoDB に保存する。Express 非依存。
 */
import type { CanvasPort } from "../ports/canvas.port";

export type UpsertCanvasUsecaseInput = {
  id?: string;
  canvasName: string;
  canvas: unknown;
  thumbnailUrl?: string | null;
  updatedBy: string;
};

export type UpsertCanvasUsecaseResult =
  | { ok: true; id: string; canvasName: string }
  | { ok: false; code: string; message: string };

export function makeUpsertCanvasUsecase(port: CanvasPort) {
  return async function upsertCanvasUsecase(
    input: UpsertCanvasUsecaseInput
  ): Promise<UpsertCanvasUsecaseResult> {
    const trimmedName = input.canvasName.trim();
    if (!trimmedName) {
      return { ok: false, code: "VALIDATION_ERROR", message: "Canvas Name is required." };
    }

    const result = await port.upsertCanvas({
      id: input.id,
      canvasName: trimmedName,
      canvas: input.canvas,
      thumbnailUrl: input.thumbnailUrl,
      updatedBy: input.updatedBy,
    });

    return { ok: true, id: result.id, canvasName: result.canvasName };
  };
}
