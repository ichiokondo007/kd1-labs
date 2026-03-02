/**
 * loadingStore を購読し、リクエスト中は PageLoading を表示する。
 * App のルート付近に 1 つだけ置く。
 */
import { useEffect, useState } from "react";
import { getLoading, subscribe } from "@/services/loadingStore";
import { PageLoading } from "@/components/page-loading";

export function GlobalLoading() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(getLoading());
    return subscribe(setLoading);
  }, []);

  return <PageLoading show={loading} />;
}
