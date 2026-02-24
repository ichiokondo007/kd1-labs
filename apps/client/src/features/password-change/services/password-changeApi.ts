import type { PasswordChangeItem } from "../types";

/**
 * services は I/O のみ担当（fetch/axios/localStorage 等）
 * UI から直接呼ばず hooks 経由で利用する。
 */

// 推測: Vite + local dev なので API base は env に寄せるのが安全
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

// 最小のエラー表現（AGENTS.md の暫定に寄せる）
type ApiError = {
  code: string;
  message: string;
};

function toApiError(e: unknown): ApiError {
  if (e instanceof Error) return { code: "UNEXPECTED", message: e.message };
  return { code: "UNEXPECTED", message: "Unexpected error" };
}

export async function fetchPasswordChangeItems(signal?: AbortSignal): Promise<PasswordChangeItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/password-change/items`, {
      method: "GET",
      credentials: "include", // session 想定
      signal,
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }

    // 暫定: success が { data: ... } 形式を想定
    const json = (await res.json()) as { data?: PasswordChangeItem[] };
    return json.data ?? [];
  } catch (e) {
    const err = toApiError(e);
    // hooks 側で UI 表示に変換するため、ここでは Error を投げるだけ
    throw new Error(`${err.code}: ${err.message}`);
  }
}

/**
 * POST /api/me/password — パスワード変更（セッション認証）
 * @throws 400 時はメッセージを Error に含める
 */
export async function postPasswordChange(newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/me/password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword }),
  });

  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    const msg = json.error?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
}