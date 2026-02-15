import { useEffect, useMemo, useState } from "react";
import type { LoginViewModel } from "../types";
import { fetchLoginItems } from "../services";
import { sortByCreatedAtDesc } from "../domain";

/**
 * hooks は:
 * - state 管理
 * - 副作用（I/O）
 * - UIイベントのハンドリング
 * を担当する。UIはこの hook の戻り値だけ見る。
 */

export function useLogin(): LoginViewModel {
  const [items, setItems] = useState<LoginViewModel["items"]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      setIsLoading(true);
      setErrorMessage(undefined);
      try {
        const data = await fetchLoginItems(ac.signal);
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

  const sorted = useMemo(() => sortByCreatedAtDesc(items), [items]);

  return { items: sorted, isLoading, errorMessage };
}