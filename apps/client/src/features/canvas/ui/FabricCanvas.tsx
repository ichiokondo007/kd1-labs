import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Canvas, Circle, Rect } from "fabric";

export type FabricCanvasHandle = {
  addRect: () => void;
  addCircle: () => void;
  toJSON: () => unknown;
  loadFromJSON: (json: unknown) => Promise<void>;
};

type FabricCanvasProps = {
  width?: number;
  height?: number;
  skipInitialRect?: boolean;
};

const DEFAULT_WIDTH = 1000;
const DEFAULT_HEIGHT = 700;

let _placeIndex = 0;
function getNextPlaceOffset(): { left: number; top: number } {
  const i = _placeIndex % 6;
  _placeIndex += 1;
  return {
    left: 180 + (i % 3) * 160,
    top: 140 + Math.floor(i / 3) * 120,
  };
}

export const FabricCanvas = forwardRef<FabricCanvasHandle, FabricCanvasProps>(
  function FabricCanvas(
    { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, skipInitialRect = false },
    ref
  ) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const canvasInstanceRef = useRef<Canvas | null>(null);

    useEffect(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const canvasEl = document.createElement("canvas");
      canvasEl.width = width;
      canvasEl.height = height;
      wrapper.appendChild(canvasEl);

      const canvas = new Canvas(canvasEl, {
        backgroundColor: "#ffffff",
        selection: true,
      });
      canvasInstanceRef.current = canvas;

      if (!skipInitialRect) {
        const rect = new Rect({
          left: 100,
          top: 100,
          width: 120,
          height: 80,
          fill: "#e3f2fd",
          stroke: "#1976d2",
          strokeWidth: 2,
        });
        canvas.add(rect);
      }

      return () => {
        canvas.dispose();
        canvasInstanceRef.current = null;
        while (wrapper.firstChild) {
          wrapper.removeChild(wrapper.firstChild);
        }
      };
    }, [width, height, skipInitialRect]);

    useImperativeHandle(
      ref,
      () => ({
        addRect() {
          const canvas = canvasInstanceRef.current;
          if (!canvas) return;
          const { left, top } = getNextPlaceOffset();
          const rect = new Rect({
            left,
            top,
            width: 120,
            height: 80,
            fill: "#e3f2fd",
            stroke: "#1976d2",
            strokeWidth: 2,
          });
          canvas.add(rect);
          canvas.requestRenderAll();
        },
        addCircle() {
          const canvas = canvasInstanceRef.current;
          if (!canvas) return;
          const { left, top } = getNextPlaceOffset();
          const circle = new Circle({
            left,
            top,
            radius: 50,
            fill: "#e8f5e9",
            stroke: "#388e3c",
            strokeWidth: 2,
          });
          canvas.add(circle);
          canvas.requestRenderAll();
        },
        toJSON() {
          return canvasInstanceRef.current?.toJSON() ?? null;
        },
        async loadFromJSON(json: unknown) {
          const canvas = canvasInstanceRef.current;
          if (!canvas || !json) return;
          await canvas.loadFromJSON(json as string | Record<string, unknown>);
          canvas.requestRenderAll();
        },
      }),
      []
    );

    return (
      <div
        ref={wrapperRef}
        className="border border-zinc-200 rounded-md shadow-sm inline-block"
      />
    );
  }
);