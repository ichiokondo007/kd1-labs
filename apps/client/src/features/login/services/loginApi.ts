import axios from "axios";
import type { LoginFormData, LoginResponse, UserInfo } from "../types";

/**
 * services は I/O のみ担当
 * UI から直接呼ばず hooks 経由で利用する。
 */

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  withCredentials: true, // session cookie 送信
  headers: { "Content-Type": "application/json" },
});

/**
 * POST /api/login
 * @returns UserInfo（成功時） / null（認証失敗時は throw）
 */
export async function postLogin(data: LoginFormData): Promise<UserInfo> {
  const res = await apiClient.post<LoginResponse>("/api/login", {
    userId: data.userId,
    password: data.password,
  });

  if (res.data.data) {
    return res.data.data;
  }

  // サーバーが 200 だがデータなし = 認証失敗
  throw new Error(
    res.data.error?.message ?? "Incorrect username or password."
  );
}
