import { XCircleIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import type { ReactNode } from "react";

const rootClasses =
  "rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400";

/**
 * 単一メッセージ用のエラーアラート（インライン表示）。
 * フォームエラーや認証エラーなど、1文のフィードバックに使用。
 */
export function ErrorAlert({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      role="alert"
      className={clsx(rootClasses, className)}
      {...props}
    >
      <div className="flex">
        <div className="shrink-0">
          <XCircleIcon aria-hidden className="size-5 text-red-400" />
        </div>
        <div className="ml-3">{children}</div>
      </div>
    </div>
  );
}

/**
 * タイトル＋説明リスト付きのエラーアラート（Tailwind Plus Alerts 風）。
 * 複数エラーや詳細説明が必要なときに使用。
 */
export function ErrorAlertWithDescription({
  title,
  items,
  children,
  className,
  ...props
}: {
  title: string;
  items?: string[];
  children?: ReactNode;
  className?: string;
} & React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      role="alert"
      className={clsx("rounded-md bg-red-50 p-4 dark:bg-red-900/20", className)}
      {...props}
    >
      <div className="flex">
        <div className="shrink-0">
          <XCircleIcon aria-hidden className="size-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
            {title}
          </h3>
          {items && items.length > 0 ? (
            <ul role="list" className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700 dark:text-red-400">
              {items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            children && (
              <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                {children}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
