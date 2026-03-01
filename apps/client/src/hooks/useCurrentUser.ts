import { useState, useEffect, useCallback } from "react";
import type { User } from "@kd1-labs/types";
import { getMe } from "@/services/meApi";

/**
 * 現在ログイン中のユーザーを取得する。
 * Dashboard レイアウト内で利用する想定。
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /** 再取得する。updatedUser を渡すと API を叩かずにその値で状態を更新する（PATCH 直後の表示反映用） */
  const refetch = useCallback(async (updatedUser?: User) => {
    if (updatedUser !== undefined) {
      setUser(updatedUser);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMe();
      setUser(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error"));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { user, isLoading, error, refetch };
}
