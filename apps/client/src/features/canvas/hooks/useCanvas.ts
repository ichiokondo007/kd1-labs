import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { CanvasListItem, CanvasListViewModel } from "../types";
import { fetchCanvasItems } from "../services";
import { sortByUpdatedAtDesc } from "../domain";

function isCancelError(e: unknown): boolean {
  return axios.isCancel(e) || (e instanceof DOMException && e.name === "AbortError");
}

export function useCanvasList(): CanvasListViewModel {
  const [items, setItems] = useState<CanvasListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      setIsLoading(true);
      setErrorMessage(undefined);
      try {
        const data = await fetchCanvasItems(ac.signal);
        if (ac.signal.aborted) return;
        setItems(data);
      } catch (e) {
        if (isCancelError(e)) return;
        const msg = e instanceof Error ? e.message : "読み込みに失敗しました";
        setErrorMessage(msg);
      } finally {
        if (!ac.signal.aborted) {
          setIsLoading(false);
        }
      }
    })();

    return () => ac.abort();
  }, []);

  const sorted = useMemo(() => sortByUpdatedAtDesc(items), [items]);

  return { items: sorted, isLoading, errorMessage };
}