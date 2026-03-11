import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Canvas,
  Circle,
  FabricImage,
  Rect,
  loadSVGFromURL,
  util,
} from "fabric";
import type { TPointerEventInfo } from "fabric";
import type { BgCropperResult } from "@/features/canvas-bg-cropper/types";
import type { CanvasTool } from "./CanvasEditorToolbar";

export type FabricCanvasHandle = {
  toJSON: () => unknown;
  loadFromJSON: (json: unknown) => Promise<void>;
  toDataURL: () => string | null;
  setBackgroundImage: (result: BgCropperResult) => Promise<void>;
  removeBackgroundImage: () => void;
  addSvgFromUrl: (url: string) => Promise<void>;
  placeSvgFromUrl: (url: string) => void;
  /** Fabric Canvas インスタンスを直接取得（Yjs 同期用） */
  getCanvas: () => Canvas | null;
};

type FabricCanvasProps = {
  width?: number;
  height?: number;
  skipInitialRect?: boolean;
  activeTool?: CanvasTool;
  onShapePlaced?: () => void;
};

const DEFAULT_WIDTH = 1088;
const DEFAULT_HEIGHT = 612;
const THUMBNAIL_WIDTH = 480;
const MAX_SVG_DISPLAY_WIDTH = 200;
const MAX_SVG_DISPLAY_HEIGHT = 200;

async function loadAndScaleSvgGroup(url: string) {
  const { objects, options } = await loadSVGFromURL(url, undefined, {
    crossOrigin: "anonymous",
  });
  const validObjects = objects.filter(
    (o): o is NonNullable<typeof o> => o != null
  );
  if (validObjects.length === 0) return null;
  const groupedObj = util.groupSVGElements(validObjects, options);
  groupedObj.setCoords();
  const w = groupedObj.getScaledWidth();
  const h = groupedObj.getScaledHeight();
  const scale = Math.min(
    MAX_SVG_DISPLAY_WIDTH / w,
    MAX_SVG_DISPLAY_HEIGHT / h,
    1
  );
  groupedObj.scale(scale);
  return groupedObj;
}

export const FabricCanvas = forwardRef<FabricCanvasHandle, FabricCanvasProps>(
  function FabricCanvas(
    {
      width = DEFAULT_WIDTH,
      height = DEFAULT_HEIGHT,
      skipInitialRect = false,
      activeTool = "selection",
      onShapePlaced,
    },
    ref
  ) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const canvasInstanceRef = useRef<Canvas | null>(null);
    const [pendingSvgUrl, setPendingSvgUrl] = useState<string | null>(null);
    const setPendingSvgUrlRef = useRef(setPendingSvgUrl);
    setPendingSvgUrlRef.current = setPendingSvgUrl;

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

    const onShapePlacedRef = useRef(onShapePlaced);
    onShapePlacedRef.current = onShapePlaced;

    const placeShape = useCallback(
      (canvas: Canvas, tool: "rect" | "circle", x: number, y: number) => {
        if (tool === "rect") {
          const rect = new Rect({
            left: x,
            top: y,
            width: 120,
            height: 80,
            fill: "#e3f2fd",
            stroke: "#1976d2",
            strokeWidth: 2,
          });
          canvas.add(rect);
        } else {
          const circle = new Circle({
            left: x,
            top: y,
            radius: 50,
            fill: "#e8f5e9",
            stroke: "#388e3c",
            strokeWidth: 2,
          });
          canvas.add(circle);
        }
        canvas.requestRenderAll();
        onShapePlacedRef.current?.();
      },
      [],
    );

    useEffect(() => {
      const canvas = canvasInstanceRef.current;
      if (!canvas) return;

      if (pendingSvgUrl) {
        canvas.selection = false;
        canvas.defaultCursor = "crosshair";
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });

        const urlToPlace = pendingSvgUrl;
        const handler = (opt: TPointerEventInfo) => {
          setPendingSvgUrl(null);
          const { x, y } = opt.scenePoint;
          void (async () => {
            const group = await loadAndScaleSvgGroup(urlToPlace);
            if (!group) return;
            const c = canvasInstanceRef.current;
            if (!c) return;
            group.set({ left: x, top: y });
            c.add(group);
            c.setActiveObject(group);
            c.requestRenderAll();
            onShapePlacedRef.current?.();
          })();
        };
        canvas.on("mouse:down", handler);

        return () => {
          canvas.off("mouse:down", handler);
          canvas.selection = true;
          canvas.defaultCursor = "default";
          canvas.forEachObject((obj) => {
            obj.selectable = true;
            obj.evented = true;
          });
        };
      }

      if (activeTool === "rect" || activeTool === "circle") {
        canvas.selection = false;
        canvas.defaultCursor = "crosshair";
        canvas.forEachObject((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });

        const tool = activeTool;
        const handler = (opt: TPointerEventInfo) => {
          const { x, y } = opt.scenePoint;
          placeShape(canvas, tool, x, y);
        };
        canvas.on("mouse:down", handler);

        return () => {
          canvas.off("mouse:down", handler);
          canvas.selection = true;
          canvas.defaultCursor = "default";
          canvas.forEachObject((obj) => {
            obj.selectable = true;
            obj.evented = true;
          });
        };
      }

      canvas.selection = true;
      canvas.defaultCursor = "default";
    }, [activeTool, placeShape, pendingSvgUrl]);

    useImperativeHandle(
      ref,
      () => ({
        toJSON() {
          return canvasInstanceRef.current?.toJSON() ?? null;
        },
        toDataURL() {
          const canvas = canvasInstanceRef.current;
          if (!canvas) return null;
          const multiplier = THUMBNAIL_WIDTH / canvas.getWidth();
          return canvas.toDataURL({
            format: "jpeg",
            quality: 0.8,
            multiplier,
          });
        },
        async loadFromJSON(json: unknown) {
          const canvas = canvasInstanceRef.current;
          if (!canvas || !json) return;
          await canvas.loadFromJSON(json as string | Record<string, unknown>);
          canvas.requestRenderAll();
        },
        async setBackgroundImage(result: BgCropperResult) {
          const canvas = canvasInstanceRef.current;
          if (!canvas) return;
          const img = await FabricImage.fromURL(result.dataUrl, {
            crossOrigin: "anonymous",
          });
          img.set({
            scaleX: result.scaleX,
            scaleY: result.scaleY,
            left: result.left,
            top: result.top,
            originX: result.originX,
            originY: result.originY,
          });
          img.canvas = canvas;
          canvas.backgroundImage = img;
          canvas.requestRenderAll();
        },
        removeBackgroundImage() {
          const canvas = canvasInstanceRef.current;
          if (!canvas) return;
          canvas.backgroundImage = undefined;
          canvas.requestRenderAll();
        },
        async addSvgFromUrl(url: string) {
          const canvas = canvasInstanceRef.current;
          if (!canvas) return;
          const group = await loadAndScaleSvgGroup(url);
          if (!group) return;
          group.set({ left: 100, top: 100 });
          canvas.add(group);
          canvas.requestRenderAll();
        },
        placeSvgFromUrl(url: string) {
          setPendingSvgUrlRef.current(url);
        },
        getCanvas() {
          return canvasInstanceRef.current;
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