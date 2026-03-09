import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricImage, Rect } from "fabric";
import { Button } from "@/components/button";
import type { BgCropperResult } from "../types";

const PREVIEW_WIDTH = 560;
const PREVIEW_HEIGHT = 350;

export type CanvasBgCropperProps = {
  imageSrc: string;
  targetWidth: number;
  targetHeight: number;
  onApply: (result: BgCropperResult) => void;
  onCancel: () => void;
};

export function CanvasBgCropper({
  imageSrc,
  targetWidth,
  targetHeight,
  onApply,
  onCancel,
}: CanvasBgCropperProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<FabricCanvas | null>(null);
  const imageRef = useRef<FabricImage | null>(null);
  const baseScaleRef = useRef(1);

  const [scale, setScale] = useState(100);
  const [origSize, setOrigSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const el = document.createElement("canvas");
    el.width = PREVIEW_WIDTH;
    el.height = PREVIEW_HEIGHT;
    wrapper.appendChild(el);

    const canvas = new FabricCanvas(el, {
      width: PREVIEW_WIDTH,
      height: PREVIEW_HEIGHT,
      backgroundColor: "#f4f4f5",
      selection: false,
    });
    canvasRef.current = canvas;

    const guideScale = Math.min(
      PREVIEW_WIDTH / targetWidth,
      PREVIEW_HEIGHT / targetHeight,
    );
    const guide = new Rect({
      width: targetWidth * guideScale,
      height: targetHeight * guideScale,
      left: PREVIEW_WIDTH / 2,
      top: PREVIEW_HEIGHT / 2,
      originX: "center",
      originY: "center",
      fill: "transparent",
      stroke: "#3b82f6",
      strokeWidth: 1.5,
      strokeDashArray: [6, 4],
      selectable: false,
      evented: false,
      opacity: 0.6,
    });

    FabricImage.fromURL(imageSrc).then((img) => {
      const bs = Math.min(
        PREVIEW_WIDTH / img.width,
        PREVIEW_HEIGHT / img.height,
      );
      baseScaleRef.current = bs;

      img.set({
        scaleX: bs,
        scaleY: bs,
        left: PREVIEW_WIDTH / 2,
        top: PREVIEW_HEIGHT / 2,
        originX: "center",
        originY: "center",
        hasControls: false,
        hasBorders: false,
        lockRotation: true,
      });

      imageRef.current = img;
      setOrigSize({ w: Math.round(img.width), h: Math.round(img.height) });

      canvas.add(img);
      canvas.add(guide);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });

    return () => {
      canvas.dispose();
      canvasRef.current = null;
      imageRef.current = null;
      while (wrapper.firstChild) wrapper.removeChild(wrapper.firstChild);
    };
  }, [imageSrc, targetWidth, targetHeight]);

  const handleScaleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const percent = Number.parseInt(e.target.value, 10);
      setScale(percent);
      const img = imageRef.current;
      if (!img) return;
      const newScale = baseScaleRef.current * (percent / 100);
      img.set({ scaleX: newScale, scaleY: newScale });
      canvasRef.current?.renderAll();
    },
    [],
  );

  const handleApply = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    const percent = scale;
    const mainScale =
      Math.min(targetWidth / img.width, targetHeight / img.height) *
      (percent / 100);

    const posRatioX = img.left / PREVIEW_WIDTH;
    const posRatioY = img.top / PREVIEW_HEIGHT;

    onApply({
      dataUrl: imageSrc,
      scaleX: mainScale,
      scaleY: mainScale,
      originX: "center",
      originY: "center",
      left: targetWidth * posRatioX,
      top: targetHeight * posRatioY,
    });
  }, [imageSrc, scale, targetWidth, targetHeight, onApply]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel],
  );

  const displayW = Math.round(
    origSize.w * baseScaleRef.current * (scale / 100),
  );
  const displayH = Math.round(
    origSize.h * baseScaleRef.current * (scale / 100),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="背景画像の設定"
    >
      <div className="w-[640px] max-w-[95vw] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-700">
          <span className="text-sm font-semibold text-zinc-950 dark:text-white">
            背景画像の設定
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

        {/* Preview */}
        <div className="flex justify-center bg-zinc-100 dark:bg-zinc-800">
          <div ref={wrapperRef} className="inline-block" />
        </div>

        <p className="py-2 text-center text-xs text-zinc-400 italic dark:text-zinc-500">
          プレビュー内をドラッグして位置を調整できます
        </p>

        {/* Image info */}
        <div className="mx-5 flex gap-5 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs dark:border-zinc-700 dark:bg-zinc-800">
          <div>
            <span className="text-zinc-400 dark:text-zinc-500">元画像: </span>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {origSize.w} × {origSize.h}px
            </span>
          </div>
          <div>
            <span className="text-zinc-400 dark:text-zinc-500">
              表示サイズ:{" "}
            </span>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {displayW} × {displayH}px
            </span>
          </div>
          <div>
            <span className="text-zinc-400 dark:text-zinc-500">Canvas: </span>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {targetWidth} × {targetHeight}px
            </span>
          </div>
        </div>

        {/* Scale slider */}
        <div className="flex items-center gap-3 px-5 py-3">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            拡大率
          </span>
          <input
            type="range"
            min={10}
            max={300}
            value={scale}
            onChange={handleScaleChange}
            className="flex-1 accent-blue-600 dark:accent-blue-400"
            aria-label="拡大率"
          />
          <span className="min-w-12 rounded-md bg-zinc-100 px-2 py-0.5 text-center text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {scale}%
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-zinc-200 px-5 py-4 dark:border-zinc-700">
          <Button plain onClick={onCancel}>
            キャンセル
          </Button>
          <Button color="zinc" onClick={handleApply}>
            取込
          </Button>
        </div>
      </div>
    </div>
  );
}
