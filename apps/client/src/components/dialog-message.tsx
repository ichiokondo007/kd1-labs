import * as Headless from "@headlessui/react";
import clsx from "clsx";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/button";

export type DialogMessageIconVariant = "success" | "warning" | "error" | "info" | "none";

const iconConfig: Record<
  Exclude<DialogMessageIconVariant, "none">,
  { Icon: typeof CheckCircleIcon; bgClass: string; iconClass: string }
> = {
  success: {
    Icon: CheckCircleIcon,
    bgClass: "bg-green-100 dark:bg-green-500/10",
    iconClass: "text-green-600 dark:text-green-400",
  },
  warning: {
    Icon: ExclamationTriangleIcon,
    bgClass: "bg-amber-100 dark:bg-amber-500/10",
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  error: {
    Icon: ExclamationCircleIcon,
    bgClass: "bg-red-100 dark:bg-red-500/10",
    iconClass: "text-red-600 dark:text-red-400",
  },
  info: {
    Icon: InformationCircleIcon,
    bgClass: "bg-blue-100 dark:bg-blue-500/10",
    iconClass: "text-blue-600 dark:text-blue-400",
  },
};

export type DialogMessageProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /** タイトル上のアイコン（省略時は none） */
  iconVariant?: DialogMessageIconVariant;
  /** 主ボタン（1ボタンのときはこれのみ） */
  primaryButton: {
    label: string;
    onClick: () => void;
  };
  /** 副ボタン（指定時は2ボタンレイアウト。Cancel など） */
  secondaryButton?: {
    label: string;
    onClick: () => void;
  };
};

/**
 * メッセージ＋ボタン1つ or 2つの共通ダイアログ。
 * 確認・成功・エラー表示などで利用する。
 */
export function DialogMessage({
  open,
  onClose,
  title,
  message,
  iconVariant = "none",
  primaryButton,
  secondaryButton,
}: DialogMessageProps) {
  const hasTwoButtons = secondaryButton != null;
  const icon = iconVariant !== "none" ? iconConfig[iconVariant] : null;
  const IconComponent = icon?.Icon;

  const handlePrimary = () => {
    primaryButton.onClick();
    onClose();
  };

  const handleSecondary = () => {
    secondaryButton?.onClick();
    onClose();
  };

  return (
    <Headless.Dialog open={open} onClose={onClose} className="relative z-50">
      <Headless.DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-zinc-900/50"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <Headless.DialogPanel
            transition
            className="relative w-full transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95 dark:bg-zinc-900 dark:ring-1 dark:ring-white/10"
          >
            <div>
              {icon && IconComponent && (
                <div
                  className={clsx(
                    "mx-auto flex size-12 items-center justify-center rounded-full",
                    icon.bgClass
                  )}
                >
                  <IconComponent aria-hidden className={clsx("size-6", icon.iconClass)} />
                </div>
              )}
              <div className={clsx("text-center sm:mt-5", icon && "mt-3")}>
                <Headless.DialogTitle
                  as="h3"
                  className="text-base font-semibold text-zinc-950 dark:text-white"
                >
                  {title}
                </Headless.DialogTitle>
                <div className="mt-2">
                  <p className="whitespace-pre-line text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
                </div>
              </div>
            </div>

            {hasTwoButtons ? (
              <div className="mt-5 flex flex-col-reverse gap-3 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <Button
                  type="button"
                  plain
                  onClick={handleSecondary}
                  className="sm:col-start-1 sm:mt-0"
                >
                  {secondaryButton.label}
                </Button>
                <Button
                  type="button"
                  onClick={handlePrimary}
                  className="sm:col-start-2"
                  data-autofocus
                >
                  {primaryButton.label}
                </Button>
              </div>
            ) : (
              <div className="mt-5 sm:mt-6">
                <Button type="button" onClick={handlePrimary} className="w-full sm:w-auto" data-autofocus>
                  {primaryButton.label}
                </Button>
              </div>
            )}
          </Headless.DialogPanel>
        </div>
      </div>
    </Headless.Dialog>
  );
}
