import { useEffect, useMemo, useState } from "react";
import type { BloglistItem, BloglistViewModel } from "../types";
import { fetchBloglistItems } from "../services";
import { sortByDateDesc } from "../domain";

export function useBloglist(): BloglistViewModel {
  const [items, setItems] = useState<BloglistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      setIsLoading(true);
      setErrorMessage(undefined);
      try {
        const data = await fetchBloglistItems(ac.signal);
        setItems(data);
      } catch (e) {
        if (ac.signal.aborted) return;
        const msg = e instanceof Error ? e.message : "読み込みに失敗しました";
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  const sorted = useMemo(() => sortByDateDesc(items), [items]);

  return { items: sorted, isLoading, errorMessage };
}
