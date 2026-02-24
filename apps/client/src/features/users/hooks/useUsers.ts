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

export function useUsers(): UsersViewModel & {
  onCreateUser: () => void;
  onPasswordReset: (id: string) => void;
  onDelete: (id: string) => void;
} {
  const [items, setItems] = useState<UsersItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      setIsLoading(true);
      setErrorMessage(undefined);
      try {
        const data = await fetchUsersItems(ac.signal);
        setItems(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "読み込みに失敗しました";
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  const sorted = useMemo(() => sortByUserName(items), [items]);

  const onCreateUser = useCallback(() => {
    // TODO: ユーザー作成モーダル／ナビゲーション
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
  };
}