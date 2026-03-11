import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { Circle, type Canvas, type FabricObject } from "fabric";
import type { FabricCanvasHandle } from "@/features/canvas/ui/FabricCanvas";

interface CircleProps {
  left: number;
  top: number;
  radius: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  scaleX: number;
  scaleY: number;
  angle: number;
}

const CIRCLE_KEYS: (keyof CircleProps)[] = [
  "left",
  "top",
  "radius",
  "fill",
  "stroke",
  "strokeWidth",
  "scaleX",
  "scaleY",
  "angle",
];

function fabricToYjs(obj: FabricObject): CircleProps {
  return {
    left: obj.left ?? 0,
    top: obj.top ?? 0,
    radius: (obj as Circle).radius ?? 50,
    fill: (typeof obj.fill === "string" ? obj.fill : "#e8f5e9"),
    stroke: (typeof obj.stroke === "string" ? obj.stroke : "#388e3c"),
    strokeWidth: obj.strokeWidth ?? 2,
    scaleX: obj.scaleX ?? 1,
    scaleY: obj.scaleY ?? 1,
    angle: obj.angle ?? 0,
  };
}

const yjsIdMap = new WeakMap<FabricObject, string>();

function getCircleId(obj: FabricObject): string {
  let id = yjsIdMap.get(obj);
  if (!id) {
    id = crypto.randomUUID();
    yjsIdMap.set(obj, id);
  }
  return id;
}

function setCircleId(obj: FabricObject, id: string): void {
  yjsIdMap.set(obj, id);
}

function isCircle(obj: FabricObject): obj is Circle {
  return obj.type === "circle";
}

/**
 * Fabric.js Canvas と Y.Map("circles") を双方向バインディングする hook。
 * Phase 1 では Circle オブジェクトのみ対象。
 */
export function useYjsCircleSync(
  yDoc: Y.Doc | null,
  fabricRef: React.RefObject<FabricCanvasHandle | null>,
  enabled: boolean,
): void {
  const isRemoteRef = useRef(false);

  useEffect(() => {
    if (!yDoc || !enabled) return;

    const canvas = fabricRef.current?.getCanvas();
    if (!canvas) return;

    const yCircles = yDoc.getMap<CircleProps>("circles");

    const handleObjectModified = (e: { target?: FabricObject }) => {
      if (isRemoteRef.current || !e.target || !isCircle(e.target)) return;
      const id = getCircleId(e.target);
      yCircles.set(id, fabricToYjs(e.target));
    };

    const handleObjectAdded = (e: { target?: FabricObject }) => {
      if (isRemoteRef.current || !e.target || !isCircle(e.target)) return;
      const id = getCircleId(e.target);
      if (!yCircles.has(id)) {
        yCircles.set(id, fabricToYjs(e.target));
      }
    };

    const handleObjectRemoved = (e: { target?: FabricObject }) => {
      if (isRemoteRef.current || !e.target || !isCircle(e.target)) return;
      const id = getCircleId(e.target);
      if (yCircles.has(id)) {
        yCircles.delete(id);
      }
    };

    const observer = (event: Y.YMapEvent<CircleProps>) => {
      isRemoteRef.current = true;
      try {
        event.keys.forEach((change, key) => {
          switch (change.action) {
            case "add": {
              const props = yCircles.get(key);
              if (!props) break;
              if (findFabricCircleById(canvas, key)) break;
              const circle = new Circle(props);
              setCircleId(circle, key);
              canvas.add(circle);
              break;
            }
            case "update": {
              const props = yCircles.get(key);
              if (!props) break;
              const existing = findFabricCircleById(canvas, key);
              if (!existing) break;
              existing.set(
                Object.fromEntries(
                  CIRCLE_KEYS.map((k) => [k, props[k]]),
                ),
              );
              existing.setCoords();
              break;
            }
            case "delete": {
              const existing = findFabricCircleById(canvas, key);
              if (existing) canvas.remove(existing);
              break;
            }
          }
        });
        canvas.requestRenderAll();
      } finally {
        isRemoteRef.current = false;
      }
    };

    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:added", handleObjectAdded);
    canvas.on("object:removed", handleObjectRemoved);
    yCircles.observe(observer);

    syncExistingCirclesToYjs(canvas, yCircles);

    return () => {
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:added", handleObjectAdded);
      canvas.off("object:removed", handleObjectRemoved);
      yCircles.unobserve(observer);
    };
  }, [yDoc, fabricRef, enabled]);
}

function findFabricCircleById(
  canvas: Canvas,
  yjsId: string,
): Circle | undefined {
  return canvas.getObjects().find(
    (obj): obj is Circle =>
      isCircle(obj) && yjsIdMap.get(obj) === yjsId,
  );
}

/**
 * 初期ロードで Canvas 上にある Circle を Y.Map に登録する。
 * 既に Y.Map にエントリがある場合（他クライアントが先に接続）はスキップ。
 */
function syncExistingCirclesToYjs(
  canvas: Canvas,
  yCircles: Y.Map<CircleProps>,
): void {
  const circles = canvas.getObjects().filter(isCircle);
  if (circles.length === 0 || yCircles.size > 0) return;

  for (const circle of circles) {
    const id = getCircleId(circle);
    if (!yCircles.has(id)) {
      yCircles.set(id, fabricToYjs(circle));
    }
  }
}
