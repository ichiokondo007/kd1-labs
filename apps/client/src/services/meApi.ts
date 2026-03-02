import type { ApiResponse, UpdateProfileRequest, User } from "@kd1-labs/types";
import { apiClient } from "./apiClient";

/**
 * GET /api/me — 現在ユーザー取得
 */
export async function getMe(): Promise<User> {
  const res = await apiClient.get<ApiResponse<User>>("/api/me");
  if (!res.data.success || !res.data.data) {
    throw new Error("Failed to get current user");
  }
  return res.data.data;
}

/**
 * PATCH /api/me — プロフィール更新（userName, screenName, avatarColor, avatarUrl）
 * @returns 更新後の User（サーバーが返す場合）。表示の即時反映に利用する。
 * @throws 400/409 時は res.data.error.message でメッセージを返す
 */
export async function patchMe(body: UpdateProfileRequest): Promise<User | void> {
  const res = await apiClient.patch<ApiResponse<User> | { success: true }>("/api/me", body);
  const data = res.data as ApiResponse<User>;
  if (data.success && data.data) {
    return data.data;
  }
  return undefined;
}

/**
 * POST /api/logout — セッション破棄（ログアウト）
 */
export async function logout(): Promise<void> {
  await apiClient.post("/api/logout");
}
