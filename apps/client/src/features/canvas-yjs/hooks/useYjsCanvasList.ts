import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { fetchCanvasItems } from "@/features/canvas/services";
import { sortByUpdatedAtDesc } from "@/features/canvas/domain";
import type { CanvasListItem } from "@kd1-labs/types";
import type { YjsCanvasListItem, YjsCanvasListViewModel } from "../types";

function isCancelError(e: unknown): boolean {
  return axios.isCancel(e) || (e instanceof DOMException && e.name === "AbortError");
}

function toYjsItem(item: CanvasListItem): YjsCanvasListItem {
  return { ...item, collabStatus: "none", activeEditors: 0 };
}

/**
 * Phase 1: REST API から一覧取得し、ステータスは placeholder で返す。
 * Phase 2: Socket 経由のリアルタイムステータスを合成する予定。
 */
export function useYjsCanvasList(): YjsCanvasListViewModel {
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

  const sorted = useMemo(
    () => sortByUpdatedAtDesc(items).map(toYjsItem),
    [items],
  );

  return { items: sorted, isLoading, errorMessage };
}
