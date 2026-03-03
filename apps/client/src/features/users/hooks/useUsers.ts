import { useCallback, useEffect, useMemo, useState } from "react";
import type { UsersItem, UsersViewModel } from "../types";
import { fetchUsersItems } from "../services";
import { sortByUserName } from "../domain";

/**
 * hooks は:
 * - state 管理
 * - 副作用（I/O）
 * - UIイベントのハンドリング
 * を担当する。UIはこの hook の戻り値だけ見る。
 */

async function loadItems(
  setItems: (items: UsersItem[]) => void,
  setErrorMessage: (msg: string | undefined) => void,
  signal?: AbortSignal
) {
  try {
    const data = await fetchUsersItems(signal);
    setItems(data);
    setErrorMessage(undefined);
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") return;
    const msg = e instanceof Error ? e.message : "読み込みに失敗しました";
    setErrorMessage(msg);
  }
}

export function useUsers(): UsersViewModel & {
  onCreateUser: () => void;
  onPasswordReset: (id: string) => void;
  onDelete: (id: string) => void;
  refetch: () => Promise<void>;
} {
  const [items, setItems] = useState<UsersItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await loadItems(setItems, setErrorMessage);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    setIsLoading(true);
    setErrorMessage(undefined);
    loadItems(setItems, setErrorMessage, ac.signal).finally(() =>
      setIsLoading(false)
    );
    return () => ac.abort();
  }, []);

  const sorted = useMemo(() => sortByUserName(items), [items]);

  const onCreateUser = useCallback(() => {
    // 呼び出し元で Drawer を開く
  }, []);

  const onPasswordReset = useCallback((_id: string) => {
    // TODO: パスワードリセット
  }, []);

  const onDelete = useCallback((_id: string) => {
    // TODO: 削除確認ダイアログ → API
  }, []);

  return {
    items: sorted,
    isLoading,
    errorMessage,
    onCreateUser,
    onPasswordReset,
    onDelete,
    refetch,
  };
}