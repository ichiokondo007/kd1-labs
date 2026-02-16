import type { Request, Response } from "express";
import type { ApiResponse, LoginRequest, LoginResponse, User } from "@kd1-labs/types";
import { loginUsecase } from "../composition/auth.composition";
import { getMeUsecase } from "../usecases/me.usecase";

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
    userId: String(body.userId ?? ""),
    password: String(body.password ?? ""),
  };

  const result = await loginUsecase(input);

  if (!result.ok) {
    // 現状の仕様は 401 を返しているが、将来的には 400/401 を分けるのが自然
    // まずは互換性優先で 401 に寄せるならここで統一可能
    const response: LoginResponse = { userInfo: null };
    res.status(401).json(response);
    return;
  }

  res.json(result.value satisfies LoginResponse);
}

/**
 * 現在ユーザー取得（スタブ）
 *
 * @route GET /api/me
 * @returns 200 ApiResponse<User>
 */
export async function getMe(req: Request, res: Response) {
  const user = await getMeUsecase();
  const response: ApiResponse<User> = { success: true, data: user };
  res.json(response);
}
