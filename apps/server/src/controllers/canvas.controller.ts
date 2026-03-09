import type { Request, Response } from "express";
import { upsertCanvasUsecase, listCanvasesUsecase, getCanvasUsecase } from "../composition/canvas.composition";

/**
 * Canvas 新規作成/更新
 *
 * @route POST /api/canvas
 * @body { canvasName: string, canvas: unknown, thumbnailUrl?: string }
 * @returns 201 { success: true, data: { id, canvasName } }
 * @returns 400 バリデーションエラー
 * @returns 401 未ログイン
 */
export async function postCanvas(req: Request, res: Response) {
  const sessionUser = req.session?.userInfo;
  if (!sessionUser) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const body = (req.body ?? {}) as {
    id?: string;
    canvasName?: string;
    canvas?: unknown;
    thumbnailUrl?: string;
  };
  const id = typeof body.id === "string" && body.id ? body.id : undefined;
  const canvasName = typeof body.canvasName === "string" ? body.canvasName : "";
  const canvas = body.canvas ?? null;
  const thumbnailUrl = typeof body.thumbnailUrl === "string" ? body.thumbnailUrl : undefined;

  const result = await upsertCanvasUsecase({
    id,
    canvasName,
    canvas,
    thumbnailUrl,
    updatedBy: sessionUser.userId,
  });

  if (!result.ok) {
    res.status(400).json({ error: { code: result.code, message: result.message } });
    return;
  }

  res.status(201).json({ success: true, data: { id: result.id, canvasName: result.canvasName } });
}

/**
 * Canvas 一覧取得
 *
 * @route GET /api/canvas/items
 * @returns 200 { success: true, data: CanvasListItem[] }
 * @returns 401 未ログイン
 */
export async function getCanvasItems(req: Request, res: Response) {
  const sessionUser = req.session?.userInfo;
  if (!sessionUser) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const items = await listCanvasesUsecase();
  res.json({ success: true, data: items });
}

/**
 * Canvas 1件取得
 *
 * @route GET /api/canvas/:id
 * @returns 200 { success: true, data: { id, canvasName, canvas } }
 * @returns 401 未ログイン
 * @returns 404 存在しない
 */
export async function getCanvas(req: Request, res: Response) {
  const sessionUser = req.session?.userInfo;
  if (!sessionUser) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const id = typeof req.params.id === "string" ? req.params.id : "";
  const result = await getCanvasUsecase(id);

  if (!result.ok) {
    const status = result.code === "NOT_FOUND" ? 404 : 400;
    res.status(status).json({ error: { code: result.code, message: result.message } });
    return;
  }

  res.json({ success: true, data: { id: result.id, canvasName: result.canvasName, canvas: result.canvas } });
}
