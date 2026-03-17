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
    fill: typeof obj.fill === "string" ? obj.fill : "#e8f5e9",
    stroke: typeof obj.stroke === "string" ? obj.stroke : "#388e3c",
    strokeWidth: obj.strokeWidth ?? 2,
    scaleX: obj.scaleX ?? 1,
    scaleY: obj.scaleY ?? 1,
    angle: obj.angle ?? 0,
  };
}

const yjsIdMap = new WeakMap<FabricObject, string>();

// crypto.randomUUID() は Secure Context (HTTPS) でのみ利用可能。
// iPad から HTTP アクセス時のフォールバック。
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

function getCircleId(obj: FabricObject): string {
  let id = yjsIdMap.get(obj);
  if (!id) {
    id = generateId();
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
 *
 * Phase 1.5: Y.Doc が SSOT。初期描画は Y.Map → Fabric の一方向のみ。
 * ユーザ操作（追加/変更/削除）は Fabric → Y.Map に反映し、
 * リモートからの Y.Map 変更は observer で Fabric に反映する。
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

    // Y.Map → Fabric: bindState で展開済みのデータを Fabric に描画
    renderYjsCirclesToCanvas(canvas, yCircles, isRemoteRef);

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
 * Y.Map → Fabric: Y.Map に既にあるエントリを Fabric Canvas に描画する。
 * isRemoteRef を true にして object:added → Y.Map への二重登録を防ぐ。
 */
function renderYjsCirclesToCanvas(
  canvas: Canvas,
  yCircles: Y.Map<CircleProps>,
  isRemoteRef: React.RefObject<boolean>,
): void {
  if (yCircles.size === 0) return;
  isRemoteRef.current = true;
  try {
    yCircles.forEach((props, key) => {
      if (findFabricCircleById(canvas, key)) return;
      const circle = new Circle(props);
      setCircleId(circle, key);
      canvas.add(circle);
    });
    canvas.requestRenderAll();
  } finally {
    isRemoteRef.current = false;
  }
}
