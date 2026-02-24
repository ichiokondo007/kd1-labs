import type { Request, Response } from "express";
import type { LoginRequest, LoginResponse } from "@kd1-labs/types";
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
      screenName: userInfo.screenName,
      isInitialPassword: userInfo.isInitialPassword,
      isAdmin: userInfo.isAdmin,
      avatarColor: userInfo.avatarColor,
    };
  }

  res.json(result.value satisfies LoginResponse);
}

/**
 * ログアウト（セッション破棄）
 *
 * @route POST /api/logout
 * @returns 200 成功（セッション削除済み）
 */
export function postLogout(req: Request, res: Response) {
  req.session?.destroy((err) => {
    if (err) {
      res.status(500).json({ success: false, message: "Failed to destroy session" });
      return;
    }
    res.status(200).json({ success: true });
  });
}
