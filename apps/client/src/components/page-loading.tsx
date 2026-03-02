/**
 * ページ単位のローディング表示（CSS のみのオーバーレイ＋スピナー）
 * サーバ処理中・画面遷移時の共通表示に利用する。
 */
import type { FC } from "react";

export type PageLoadingProps = {
  /** 表示するか */
  show: boolean;
  /** オーバーレイの z-index（レイアウトの上に出すため） */
  className?: string;
};

export const PageLoading: FC<PageLoadingProps> = ({ show, className }) => {
  if (!show) return null;

  return (
    <div
      className={
        className ??
        "fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/20 backdrop-blur-[2px] dark:bg-zinc-950/40"
      }
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div
        className="size-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300"
        aria-hidden
      />
    </div>
  );
};
