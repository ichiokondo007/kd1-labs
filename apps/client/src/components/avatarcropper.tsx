/**
 * AvatarCropper - 円形アバター画像クロッパー（設定画面のアバター編集用）
 *
 * 画像をドラッグ・ズームで調整し、円形でクロップして dataURL で返す。
 * I/O は行わず、onCropComplete / onCancel で親に委譲する。
 *
 * @example
 * ```tsx
 * <AvatarCropper
 *   imageSrc={previewUrl}
 *   onCropComplete={(dataUrl) => setAvatar(dataUrl)}
 *   onCancel={() => setShowCropper(false)}
 * />
 * ```
 */

import { useCallback, useId, useRef, useState } from "react";
import { Button } from "@/components/button";

// ── Types ────────────────────────────────────────────────────

export interface AvatarCropperProps {
  /** クロップ対象の画像URL（dataURL or URL） */
  imageSrc: string;
  /** クロップ完了時のコールバック */
  onCropComplete: (dataUrl: string) => void;
  /** キャンセル時のコールバック */
  onCancel: () => void;
  /** 出力画像サイズ (px, 正方形) */
  outputSize?: number;
  /** クロップ円の表示サイズ (px) */
  cropSize?: number;
  /** 最小ズーム倍率 */
  minZoom?: number;
  /** 最大ズーム倍率 */
  maxZoom?: number;
  /** 出力フォーマット */
  outputFormat?: "image/png" | "image/jpeg";
  /** 出力品質 (jpeg 時のみ有効) */
  quality?: number;
  /** モーダルタイトル */
  title?: string;
  /** 確定ボタンラベル */
  confirmLabel?: string;
  /** キャンセルボタンラベル */
  cancelLabel?: string;
}

// ── Helpers ──────────────────────────────────────────────────

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// ── Component ────────────────────────────────────────────────

export function AvatarCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  outputSize = 256,
  cropSize = 240,
  minZoom = 0.5,
  maxZoom = 4,
  outputFormat = "image/png",
  quality = 0.92,
  title = "Crop your avatar",
  confirmLabel = "Set new avatar",
  cancelLabel = "Cancel",
}: AvatarCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const maskId = useId().replace(/:/g, "-");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        ox: offset.x,
        oy: offset.y,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [offset],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handlePointerUp = useCallback(() => setDragging(false), []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      setScale((prev) =>
        Math.min(maxZoom, Math.max(minZoom, prev - e.deltaY * 0.001)),
      );
    },
    [minZoom, maxZoom],
  );

  const handleZoomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setScale(Number.parseFloat(e.target.value)),
    [],
  );

  const handleCrop = useCallback(async () => {
    if (!containerRef.current) return;
    setProcessing(true);
    try {
      const img = await loadImage(imageSrc);
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const displayW = img.width * scale;
      const displayH = img.height * scale;
      const imgLeft = centerX - displayW / 2 + offset.x;
      const imgTop = centerY - displayH / 2 + offset.y;

      const cropLeft = centerX - cropSize / 2;
      const cropTop = centerY - cropSize / 2;
      const srcX = ((cropLeft - imgLeft) / displayW) * img.width;
      const srcY = ((cropTop - imgTop) / displayH) * img.height;
      const srcW = (cropSize / displayW) * img.width;
      const srcH = (cropSize / displayH) * img.height;

      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const r = outputSize / 2;

      ctx.beginPath();
      ctx.arc(r, r, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outputSize, outputSize);

      const dataUrl = canvas.toDataURL(outputFormat, quality);
      onCropComplete(dataUrl);
    } catch (err) {
      console.error("AvatarCropper: crop failed", err);
    } finally {
      setProcessing(false);
    }
  }, [
    imageSrc,
    offset,
    scale,
    cropSize,
    outputSize,
    outputFormat,
    quality,
    onCropComplete,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel],
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-[420px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-700">
          <span className="text-sm font-semibold text-zinc-950 dark:text-white">
            {title}
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>

        {/* Crop area */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          className={`relative h-80 w-full touch-none select-none overflow-hidden bg-zinc-100 dark:bg-zinc-800 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          <img
            src={imageSrc}
            alt=""
            draggable={false}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
            style={{
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
            }}
          />
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <mask id={maskId}>
                <rect width="100%" height="100%" fill="white" />
                <circle cx="50%" cy="50%" r={cropSize / 2} fill="black" />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.5)"
              mask={`url(#${maskId})`}
            />
            <circle
              cx="50%"
              cy="50%"
              r={cropSize / 2}
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          </svg>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-3 border-t border-zinc-200 px-5 py-3 dark:border-zinc-700">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">−</span>
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={scale}
            onChange={handleZoomChange}
            className="flex-1 accent-zinc-600 dark:accent-zinc-400"
            aria-label="Zoom"
          />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">+</span>
          <span className="min-w-10 font-mono text-right text-xs text-zinc-500 dark:text-zinc-400">
            {Math.round(scale * 100)}%
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-zinc-200 px-5 py-4 dark:border-zinc-700">
          <Button plain onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            color="zinc"
            onClick={handleCrop}
            disabled={processing}
            className="min-w-28"
          >
            {processing ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
