import type { Request, Response } from "express";
import type { ApiResponse } from "@kd1-labs/types";
import { listUsersUsecase } from "../composition/users.composition";
import { createUserUsecase } from "../composition/create-user.composition";
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

/**
 * 新規ユーザー作成（管理者のみ）。固定パスワードで登録。
 *
 * @route POST /api/users
 * @body { userName: string, screenName: string }
 * @returns 201 { success: true, data: { userName } }
 * @returns 400 入力不備
 * @returns 401 未ログイン
 * @returns 403 管理者以外
 * @returns 409 user_name 重複
 */
export async function postUser(req: Request, res: Response) {
  const sessionUser = req.session?.userInfo;
  if (!sessionUser) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  if (!sessionUser.isAdmin) {
    res.status(403).json({ error: { code: "FORBIDDEN", message: "Admin only." } });
    return;
  }

  const body = (req.body ?? {}) as { userName?: string; screenName?: string };
  const userName = typeof body.userName === "string" ? body.userName : "";
  const screenName = typeof body.screenName === "string" ? body.screenName : "";

  const result = await createUserUsecase(userName, screenName);

  if (!result.ok) {
    if (result.code === "DUPLICATE_USER_NAME") {
      res.status(409).json({ error: { code: result.code, message: result.message } });
      return;
    }
    res.status(400).json({ error: { code: result.code, message: result.message } });
    return;
  }

  res.status(201).json({ success: true, data: { userName: result.userName } });
}
