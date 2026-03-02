import type { LoginFormData, LoginResponse, UserInfo } from "../types";
import { apiClient } from "@/services/apiClient";

/**
 * services は I/O のみ担当
 * UI から直接呼ばず hooks 経由で利用する。
 */

/**
 * POST /api/login
 * @returns UserInfo（成功時） / null（認証失敗時は throw）
 */
export async function postLogin(data: LoginFormData): Promise<UserInfo> {
  const res = await apiClient.post<LoginResponse>("/api/login", {
    userName: data.userName,
    password: data.password,
  });

  if (res.data.userInfo) {
    return res.data.userInfo;
  }

  const msg = res.data.error?.message ?? "Incorrect username or password.";
  throw new Error(msg);
}
