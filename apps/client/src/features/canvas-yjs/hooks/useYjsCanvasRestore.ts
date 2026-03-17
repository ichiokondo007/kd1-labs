import { useEffect, useState } from "react";
import * as Y from "yjs";
import { FabricImage } from "fabric";
import type { FabricCanvasHandle } from "@/features/canvas/ui/FabricCanvas";

interface BackgroundImageData {
  src: string;
  scaleX?: number;
  scaleY?: number;
  left?: number;
  top?: number;
  originX?: string;
  originY?: string;
  [key: string]: unknown;
}

interface RestoreResult {
  canvasName: string;
  isRestored: boolean;
}

/**
 * Y.Doc の sync 完了後に meta (背景画像・canvasName) を Fabric Canvas に復元する hook。
 * Circle 等のオブジェクト復元は useYjsCircleSync が担当する。
 */
export function useYjsCanvasRestore(
  yDoc: Y.Doc | null,
  fabricRef: React.RefObject<FabricCanvasHandle | null>,
  synced: boolean,
): RestoreResult {
  const [canvasName, setCanvasName] = useState("");
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    if (!yDoc || !synced || isRestored) return;

    const yMeta = yDoc.getMap("meta");

    const name = (yMeta.get("canvasName") as string) ?? "";
    setCanvasName(name);

    const bgRaw = yMeta.get("backgroundImage");
    if (bgRaw && fabricRef.current) {
      void restoreBackground(fabricRef.current, bgRaw);
    }

    setIsRestored(true);
  }, [yDoc, synced, isRestored, fabricRef]);

  return { canvasName, isRestored };
}

async function restoreBackground(
  handle: FabricCanvasHandle,
  bgRaw: unknown,
): Promise<void> {
  let src: string | null = null;
  let scaleX = 1;
  let scaleY = 1;
  let left = 0;
  let top = 0;
  let originX = "left";
  let originY = "top";

  if (typeof bgRaw === "string") {
    src = bgRaw;
  } else if (bgRaw && typeof bgRaw === "object") {
    const data = bgRaw as BackgroundImageData;
    src = data.src ?? null;
    scaleX = data.scaleX ?? 1;
    scaleY = data.scaleY ?? 1;
    left = data.left ?? 0;
    top = data.top ?? 0;
    originX = data.originX ?? "left";
    originY = data.originY ?? "top";
  }

  if (!src) return;

  try {
    const canvas = handle.getCanvas();
    if (!canvas) return;

    const img = await FabricImage.fromURL(src, {
      crossOrigin: "anonymous",
    });
    img.set({ scaleX, scaleY, left, top, originX, originY });
    img.canvas = canvas;
    canvas.backgroundImage = img;
    canvas.requestRenderAll();
  } catch (err) {
    console.warn("[useYjsCanvasRestore] Failed to restore background:", err);
  }
}
