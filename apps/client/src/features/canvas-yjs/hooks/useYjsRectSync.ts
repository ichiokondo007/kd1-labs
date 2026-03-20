import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { Rect, type Canvas, type FabricObject } from "fabric";
import type { FabricCanvasHandle } from "@/features/canvas/ui/FabricCanvas";
import type { RectYjsProps } from "../domain/rectYjs";
import { RECT_YJS_KEYS } from "../domain/rectYjs";
import { isApplyingRemote } from "./collabRemoteDepth";

function fabricToYjs(obj: FabricObject): RectYjsProps {
  const r = obj as Rect;
  return {
    left: obj.left ?? 0,
    top: obj.top ?? 0,
    width: r.width ?? 120,
    height: r.height ?? 80,
    fill: typeof obj.fill === "string" ? obj.fill : "#e3f2fd",
    stroke: typeof obj.stroke === "string" ? obj.stroke : "#1976d2",
    strokeWidth: obj.strokeWidth ?? 2,
    scaleX: obj.scaleX ?? 1,
    scaleY: obj.scaleY ?? 1,
    angle: obj.angle ?? 0,
    skewX: obj.skewX ?? 0,
    skewY: obj.skewY ?? 0,
    opacity: obj.opacity ?? 1,
    flipX: !!obj.flipX,
    flipY: !!obj.flipY,
    visible: obj.visible !== false,
  };
}

const yjsIdMap = new WeakMap<FabricObject, string>();

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function getRectId(obj: FabricObject): string {
  let id = yjsIdMap.get(obj);
  if (!id) {
    id = generateId();
    yjsIdMap.set(obj, id);
  }
  return id;
}

function setRectId(obj: FabricObject, id: string): void {
  yjsIdMap.set(obj, id);
}

function isRectShape(obj: FabricObject): obj is Rect {
  return obj.type === "rect";
}

function findFabricRectById(canvas: Canvas, yjsId: string): Rect | undefined {
  return canvas.getObjects().find(
    (obj): obj is Rect =>
      isRectShape(obj) && yjsIdMap.get(obj) === yjsId,
  );
}

/**
 * Fabric Rect と Y.Map("rects") の双方向同期。
 */
export function useYjsRectSync(
  yDoc: Y.Doc | null,
  fabricRef: React.RefObject<FabricCanvasHandle | null>,
  enabled: boolean,
  remoteApplyDepthRef?: React.MutableRefObject<number>,
): void {
  const internalDepthRef = useRef(0);
  const depthRef = remoteApplyDepthRef ?? internalDepthRef;

  useEffect(() => {
    if (!yDoc || !enabled) return;

    const canvas = fabricRef.current?.getCanvas();
    if (!canvas) return;

    const yRects = yDoc.getMap<RectYjsProps>("rects");

    const handleObjectModified = (e: { target?: FabricObject }) => {
      if (isApplyingRemote(depthRef) || !e.target || !isRectShape(e.target)) return;
      const id = getRectId(e.target);
      yRects.set(id, fabricToYjs(e.target));
    };

    const handleObjectAdded = (e: { target?: FabricObject }) => {
      if (isApplyingRemote(depthRef) || !e.target || !isRectShape(e.target)) return;
      const id = getRectId(e.target);
      if (!yRects.has(id)) {
        yRects.set(id, fabricToYjs(e.target));
      }
    };

    const handleObjectRemoved = (e: { target?: FabricObject }) => {
      if (isApplyingRemote(depthRef) || !e.target || !isRectShape(e.target)) return;
      const id = getRectId(e.target);
      if (yRects.has(id)) {
        yRects.delete(id);
      }
    };

    const observer = (event: Y.YMapEvent<RectYjsProps>) => {
      depthRef.current += 1;
      try {
        event.keys.forEach((change, key) => {
          switch (change.action) {
            case "add": {
              const props = yRects.get(key);
              if (!props) break;
              if (findFabricRectById(canvas, key)) break;
              const rect = new Rect(props);
              setRectId(rect, key);
              canvas.add(rect);
              break;
            }
            case "update": {
              const props = yRects.get(key);
              if (!props) break;
              const existing = findFabricRectById(canvas, key);
              if (!existing) break;
              existing.set(
                Object.fromEntries(
                  RECT_YJS_KEYS.map((k) => [k, props[k]]),
                ),
              );
              existing.setCoords();
              break;
            }
            case "delete": {
              const existing = findFabricRectById(canvas, key);
              if (existing) canvas.remove(existing);
              break;
            }
          }
        });
        canvas.requestRenderAll();
      } finally {
        depthRef.current -= 1;
      }
    };

    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:added", handleObjectAdded);
    canvas.on("object:removed", handleObjectRemoved);
    yRects.observe(observer);

    renderYjsRectsToCanvas(canvas, yRects, depthRef);

    return () => {
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:added", handleObjectAdded);
      canvas.off("object:removed", handleObjectRemoved);
      yRects.unobserve(observer);
    };
  }, [yDoc, fabricRef, enabled, remoteApplyDepthRef]); // eslint-disable-line react-hooks/exhaustive-deps -- depthRef
}

function renderYjsRectsToCanvas(
  canvas: Canvas,
  yRects: Y.Map<RectYjsProps>,
  depthRef: React.MutableRefObject<number>,
): void {
  if (yRects.size === 0) return;
  depthRef.current += 1;
  try {
    yRects.forEach((props, key) => {
      if (findFabricRectById(canvas, key)) return;
      const rect = new Rect(props);
      setRectId(rect, key);
      canvas.add(rect);
    });
    canvas.requestRenderAll();
  } finally {
    depthRef.current -= 1;
  }
}
