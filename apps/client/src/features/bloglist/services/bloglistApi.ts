import type { BloglistItem } from "../types";

/**
 * public/md/index.json から記事一覧を取得する。
 */
export async function fetchBloglistItems(signal?: AbortSignal): Promise<BloglistItem[]> {
  const res = await fetch("/md/index.json", { signal });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  return (await res.json()) as BloglistItem[];
}
