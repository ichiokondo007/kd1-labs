import type { Request, Response } from "express";
import type {
  ApiResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  User,
} from "@kd1-labs/types";
import { findUserById } from "@kd1-labs/db-client";
import { changePasswordUsecase, updateProfileUsecase } from "../composition/me.composition";

/**
 * 現在ユーザー取得（セッションで認証し、表示用は DB から取得）
 * DB の userName / avatarColor を返すため、Settings で保存した色が常に反映される。
 *
 * @route GET /api/me
 * @returns 200 ApiResponse<User>
 * @returns 401 未ログイン
 */
export async function getMe(req: Request, res: Response) {
  const sessionUser = req.session?.userInfo;
  if (!sessionUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const row = await findUserById(sessionUser.userId);
  if (!row) {
    res.status(401).json({ success: false, message: "User not found" });
    return;
  }

  const user: User = {
    userId: row.userId,
    userName: row.userName,
    screenName: row.screenName,
    isAdmin: row.isAdmin,
    isInitialPassword: row.isInitialPassword,
    avatarUrl: row.avatarUrl ?? null,
    avatarColor: row.avatarColor ?? "zinc-900",
    updatedAt: row.updatedAt,
  };
  const response: ApiResponse<User> = { success: true, data: user };
  res.json(response);
}

/**
 * プロフィール更新（userName, avatarColor）
 *
 * @route PATCH /api/me
 * @returns 200 成功
 * @returns 400 バリデーションエラー
 * @returns 409 ユーザー名重複
 * @returns 401 未ログイン
 */
export async function patchMe(req: Request, res: Response) {
  const sessionUser = req.session?.userInfo;
  if (!sessionUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const body = (req.body ?? {}) as Partial<UpdateProfileRequest>;
  const input: UpdateProfileRequest = {
    userName: String(body.userName ?? ""),
    avatarColor: String(body.avatarColor ?? "zinc-900"),
  };

  const result = await updateProfileUsecase({
    userId: sessionUser.userId,
    userName: input.userName,
    avatarColor: input.avatarColor,
  });

  if (!result.ok) {
    const status = result.code === "USER_NAME_TAKEN" ? 409 : 400;
    res.status(status).json({
      error: { code: result.code, message: result.message },
    });
    return;
  }

  // セッションを更新（次回 GET /api/me で反映）
  if (req.session?.userInfo) {
    req.session.userInfo = {
      ...req.session.userInfo,
      userName: input.userName.trim(),
      avatarColor: input.avatarColor,
    };
  }

  res.status(200).json({ success: true });
}

/**
 * パスワード変更（初回変更・任意変更）
 *
 * @route POST /api/me/password
 * @body ChangePasswordRequest { newPassword }
 * @returns 200 成功
 * @returns 400 バリデーションエラー
 * @returns 401 未ログイン
 */
export async function postPasswordMe(req: Request, res: Response) {
  const sessionUser = req.session?.userInfo;
  if (!sessionUser) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    return;
  }

  const body = (req.body ?? {}) as Partial<ChangePasswordRequest>;
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  const result = await changePasswordUsecase({
    userId: sessionUser.userId,
    newPassword,
  });

  if (!result.ok) {
    res.status(400).json({
      error: { code: result.code, message: result.message },
    });
    return;
  }

  if (req.session?.userInfo) {
    req.session.userInfo = {
      ...req.session.userInfo,
      isInitialPassword: false,
    };
  }

  res.status(200).json({ success: true });
}
