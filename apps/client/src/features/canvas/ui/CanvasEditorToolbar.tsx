import type { FC } from "react";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  CursorArrowRaysIcon,
  CircleStackIcon,
  RectangleStackIcon,
  PhotoIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

export type CanvasTool =
  | "selection"
  | "rect"
  | "circle"
  | "image"
  | "text";

export type CanvasEditorToolbarProps = {
  activeTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  /** Undo が押せるか */
  undoDisabled?: boolean;
  /** Redo が押せるか */
  redoDisabled?: boolean;
};

const TOOL_BUTTONS: {
  tool: CanvasTool;
  label: string;
  icon: FC<{ className?: string }>;
}[] = [
    { tool: "selection", label: "選択", icon: CursorArrowRaysIcon },
    { tool: "rect", label: "Rect", icon: RectangleStackIcon },
    { tool: "circle", label: "Circle", icon: CircleStackIcon },
    { tool: "image", label: "登録画像", icon: PhotoIcon },
    { tool: "text", label: "文字入力", icon: DocumentTextIcon },
  ];

/**
 * キャンバス編集用ツールバー（Presentational）
 * - ツール選択・Undo/Redo は props で受け取り、I/O は行わない
 */
export const CanvasEditorToolbar: FC<CanvasEditorToolbarProps> = ({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  undoDisabled = true,
  redoDisabled = true,
}) => {
  return (
    <nav
      className="flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
      aria-label="キャンバスツール"
    >
      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={undoDisabled}
          className="flex flex-col items-center justify-center gap-0.5 rounded-md px-3 py-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-40 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          title="元に戻す"
          aria-label="元に戻す"
        >
          <ArrowUturnLeftIcon className="size-5" aria-hidden />
          <span className="text-[10px] leading-none">元に戻す</span>
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={redoDisabled}
          className="flex flex-col items-center justify-center gap-0.5 rounded-md px-3 py-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-40 disabled:hover:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          title="やり直す"
          aria-label="やり直す"
        >
          <ArrowUturnRightIcon className="size-5" aria-hidden />
          <span className="text-[10px] leading-none">やり直す</span>
        </button>
      </div>

      <div
        className="mx-1.5 h-6 w-px bg-zinc-200 dark:bg-zinc-700"
        aria-hidden
      />

      {/* ツールボタン */}
      <div className="flex items-center gap-0.5">
        {TOOL_BUTTONS.map(({ tool, label, icon: Icon }) => (
          <button
            key={tool}
            type="button"
            onClick={() => onToolChange(tool)}
            className={clsx(
              "flex flex-col items-center justify-center gap-0.5 rounded-md px-3 py-2 transition",
              activeTool === tool
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            )}
            title={label}
            {...(activeTool === tool && { "aria-pressed": "true" as const })}
            aria-label={label}
          >
            <Icon className="size-5" aria-hidden />
            <span className="text-[10px] leading-none">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
