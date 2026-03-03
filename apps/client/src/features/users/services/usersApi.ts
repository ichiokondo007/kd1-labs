import type { UsersItem } from "../types";
import { addRequest, removeRequest } from "@/services/loadingStore";
import { apiClient } from "@/services/apiClient";

/**
 * services は I/O のみ担当（fetch/axios/localStorage 等）
 * UI から直接呼ばず hooks 経由で利用する。
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export type CreateUserResult = { ok: true; userName: string } | { ok: false; message: string };

type ApiError = {
  code: string;
  message: string;
};

function toApiError(e: unknown): ApiError {
  if (e instanceof Error) return { code: "UNEXPECTED", message: e.message };
  return { code: "UNEXPECTED", message: "Unexpected error" };
}

export async function fetchUsersItems(signal?: AbortSignal): Promise<UsersItem[]> {
  addRequest();
  try {
    const res = await fetch(`${API_BASE}/api/users/items`, {
      method: "GET",
      credentials: "include", // session 想定
      signal,
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }

    // 暫定: success が { data: ... } 形式を想定。API 未実装時は空配列
    const json = (await res.json()) as { data?: unknown };
    const raw = json.data;
    if (!Array.isArray(raw)) return [];
    return raw.map((row: Record<string, unknown>) => ({
      id: String(row.id ?? ""),
      avatarUrl: row.avatarUrl != null ? String(row.avatarUrl) : null,
      avatarColor: row.avatarColor != null ? String(row.avatarColor) : undefined,
      userName: String(row.userName ?? row.name ?? ""),
      screenName: String(row.screenName ?? row.handle ?? ""),
      role: String(row.role ?? ""),
    })) as UsersItem[];
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") throw e;
    const err = toApiError(e);
    throw new Error(`${err.code}: ${err.message}`);
  } finally {
    removeRequest();
  }
}

/**
 * POST /api/users — 新規ユーザー作成（管理者のみ。固定パスワード）
 */
export async function createUser(userName: string, screenName: string): Promise<CreateUserResult> {
  try {
    const res = await apiClient.post<{ success: true; data: { userName: string } }>("/api/users", {
      userName: userName.trim(),
      screenName: screenName.trim(),
    });
    if (res.data?.success && res.data?.data?.userName) {
      return { ok: true, userName: res.data.data.userName };
    }
    return { ok: false, message: "Unexpected response." };
  } catch (e: unknown) {
    const err = e as { response?: { status: number; data?: { error?: { message?: string } } } };
    const message =
      err.response?.data?.error?.message ?? (e instanceof Error ? e.message : "Failed to create user.");
    if (err.response?.status === 409) {
      return { ok: false, message };
    }
    return { ok: false, message };
  }
}