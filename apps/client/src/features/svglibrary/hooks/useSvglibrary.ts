import { useCallback, useEffect, useMemo, useState } from "react";
import type { SvgAssetItem, SvglibraryViewModel } from "../types";
import { fetchSvgAssets, deleteSvgAsset } from "../services";
import { sortByCreatedAtDesc } from "../domain";

export function useSvglibrary(): SvglibraryViewModel & {
  reload: () => void;
  removeItem: (key: string) => Promise<void>;
} {
  const [items, setItems] = useState<SvgAssetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      setIsLoading(true);
      setErrorMessage(undefined);
      try {
        const data = await fetchSvgAssets(ac.signal);
        setItems(data);
      } catch (e) {
        if (ac.signal.aborted) return;
        const msg = e instanceof Error ? e.message : "読み込みに失敗しました";
        setErrorMessage(msg);
      } finally {
        if (!ac.signal.aborted) setIsLoading(false);
      }
    })();

    return () => ac.abort();
  }, [refreshKey]);

  const sorted = useMemo(() => sortByCreatedAtDesc(items), [items]);

  const reload = useCallback(() => setRefreshKey((k) => k + 1), []);

  const removeItem = useCallback(async (key: string) => {
    try {
      await deleteSvgAsset(key);
      setItems((prev) => prev.filter((it) => it.key !== key));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "削除に失敗しました";
      setErrorMessage(msg);
    }
  }, []);

  return { items: sorted, isLoading, errorMessage, reload, removeItem };
}
