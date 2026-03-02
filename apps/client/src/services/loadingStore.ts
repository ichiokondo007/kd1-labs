/**
 * グローバルローディング状態（サーバ処理中・画面遷移時の共通表示用）
 * リクエスト開始で +1、終了で -1。count > 0 のときローディング表示する。
 */

type Listener = (loading: boolean) => void;

let count = 0;
const listeners = new Set<Listener>();

function notify() {
  const loading = count > 0;
  listeners.forEach((fn) => fn(loading));
}

export function addRequest(): void {
  count += 1;
  notify();
}

export function removeRequest(): void {
  count = Math.max(0, count - 1);
  notify();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getLoading(): boolean {
  return count > 0;
}
