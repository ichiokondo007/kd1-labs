import type { Request, Response } from "express";
import type { ApiResponse } from "@kd1-labs/types";
import { listUsersUsecase } from "../composition/users.composition";
import type { ListUsersOutputItem } from "../usecases/list-users.usecase";

/**
 * ユーザー一覧取得（管理者のみ）
 *
 * @route GET /api/users/items
 * @returns 200 ApiResponse<ListUsersOutputItem[]>
 * @returns 401 未ログイン
 * @returns 403 管理者以外
 */
export async function getUsersItems(req: Request, res: Response) {
  const sessionUser = req.session?.userInfo;
  if (!sessionUser) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  if (!sessionUser.isAdmin) {
    res.status(403).json({ error: { code: "FORBIDDEN", message: "Admin only." } });
    return;
  }

  const items: ListUsersOutputItem[] = await listUsersUsecase();
  const response: ApiResponse<ListUsersOutputItem[]> = { success: true, data: items };
  res.json(response);
}
