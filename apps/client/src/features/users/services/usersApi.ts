import type { UsersItem } from "../types";
import { addRequest, removeRequest } from "@/services/loadingStore";

/**
 * services は I/O のみ担当（fetch/axios/localStorage 等）
 * UI から直接呼ばず hooks 経由で利用する。
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

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