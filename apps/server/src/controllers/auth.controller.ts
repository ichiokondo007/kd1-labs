import type { Request, Response } from "express";
import type { ApiResponse, LoginRequest, LoginResponse, User } from "@kd1-labs/types";
import { loginUsecase } from "../composition/auth.composition";

/**
 * ログイン（参照: references/pages/login.md）
 * 認証・DB は未接続のためスタブ。
 *
 * ルール:
 * - Controller は req/res ⇄ DTO 変換と status code の責務のみ
 * - ビジネスロジックは usecase に集約（Express を import しない）
 *
 * @route POST /api/login
 * @returns 200 LoginResponse
 * @returns 400 入力不備（必須項目不足）
 * @returns 401 認証失敗（将来）
 */
export async function postLogin(req: Request, res: Response) {
  const body = (req.body ?? {}) as Partial<LoginRequest>;

  // DTO化（req/resから切り離す）
  const input: LoginRequest = {
    userName: String(body.userName ?? ""),
    password: String(body.password ?? ""),
  };

  const result = await loginUsecase(input);

  if (!result.ok) {
    const response: LoginResponse = {
      userInfo: null,
      error: { message: result.error.message },
    };
    res.status(401).json(response);
    return;
  }

  // ログイン成功時は必ずセッションに UserInfo を保存（HTTP レイヤの責務）
  const userInfo = result.value.userInfo;
  if (userInfo && req.session) {
    req.session.userInfo = {
      userId: userInfo.userId,
      userName: userInfo.userName,
      isInitialPassword: userInfo.isInitialPassword,
      isAdmin: userInfo.isAdmin,
    };
  }

  res.json(result.value satisfies LoginResponse);
}

/**
 * 現在ユーザー取得（セッションから取得。アバターはセッション情報を元に構築）
 *
 * @route GET /api/me
 * @returns 200 ApiResponse<User> セッションあり
 * @returns 401 セッションなし（未ログイン）
 */
export async function getMe(req: Request, res: Response) {
  const sessionUser = req.session?.userInfo;
  if (!sessionUser) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  // セッションの情報から User を構築（アバターは未設定時はデフォルト）
  const user: User = {
    ...sessionUser,
    avatarUrl: null,
    avatarColor: "zinc-900",
    updatedAt: new Date(),
  };
  const response: ApiResponse<User> = { success: true, data: user };
  res.json(response);
}
