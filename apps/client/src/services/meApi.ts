import axios from "axios";
import type { ApiResponse, User } from "@kd1-labs/types";

/**
 * 認証付き API クライアント（/api/me 等で利用）
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

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
