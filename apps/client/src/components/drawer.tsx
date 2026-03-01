import * as Headless from "@headlessui/react";
import clsx from "clsx";
import type React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const widths = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
} as const;

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  /** パネル幅（default: 2xl） */
  size?: keyof typeof widths;
  /** 表示位置（default: right） */
  position?: "left" | "right";
  className?: string;
  children: React.ReactNode;
};

/**
 * 右（または左）からスライドインする Drawer。
 * 他画面でも利用する共通コンポーネント。
 */
export function Drawer({
  open,
  onClose,
  size = "2xl",
  position = "right",
  className,
  children,
}: DrawerProps) {
  return (
    <Headless.Dialog open={open} onClose={onClose} className="relative z-50">
      <Headless.DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-950/25 transition duration-200 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in dark:bg-zinc-950/50"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={clsx(
              "pointer-events-none fixed inset-y-0 flex max-w-full",
              position === "right" && "right-0 pl-10 sm:pl-16",
              position === "left" && "left-0 pr-10 sm:pr-16"
            )}
          >
            <Headless.DialogPanel
              transition
              className={clsx(
                "pointer-events-auto flex h-full w-screen transform flex-col transition duration-300 ease-out data-closed:translate-x-full sm:duration-500",
                position === "right" && "data-closed:translate-x-full",
                position === "left" && "data-closed:-translate-x-full",
                widths[size],
                className
              )}
            >
              <div className="flex flex-1 flex-col overflow-y-auto bg-white shadow-xl ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
                {children}
              </div>
            </Headless.DialogPanel>
          </div>
        </div>
      </div>
    </Headless.Dialog>
  );
}

export type DrawerHeaderProps = {
  title: string;
  onClose: () => void;
  className?: string;
};

/** タイトルと閉じるボタンを持つヘッダー */
export function DrawerHeader({ title, onClose, className }: DrawerHeaderProps) {
  return (
    <div
      className={clsx(
        "flex items-start justify-between border-b border-zinc-950/5 px-4 py-4 dark:border-white/5 sm:px-6",
        className
      )}
    >
      <Headless.DialogTitle className="text-base font-semibold text-zinc-950 dark:text-white">
        {title}
      </Headless.DialogTitle>
      <button
        type="button"
        onClick={onClose}
        className="relative rounded-lg p-1 text-zinc-400 hover:text-zinc-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:hover:text-zinc-300"
        aria-label="閉じる"
      >
        <XMarkIcon className="size-6" aria-hidden />
      </button>
    </div>
  );
}

export function DrawerBody({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...props}
      className={clsx("flex-1 overflow-y-auto px-4 py-4 sm:px-6", className)}
    />
  );
}
