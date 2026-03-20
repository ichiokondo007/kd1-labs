import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { Group, type Canvas, type FabricObject } from "fabric";
import type { FabricCanvasHandle } from "@/features/canvas/ui/FabricCanvas";
import type { SvgPlacementYjsProps } from "../domain/svgPlacementYjs";
import { SVG_PLACEMENT_TRANSFORM_KEYS } from "../domain/svgPlacementYjs";
import { loadSvgGroupUnscaled } from "../services/loadSvgGroupForCollab";
import { isApplyingRemote } from "./collabRemoteDepth";

function readSvgPlacementMeta(obj: FabricObject): {
  key: string;
  url: string;
} | null {
  const raw = obj as FabricObject & {
    svgAssetKey?: unknown;
    svgAssetUrl?: unknown;
  };
  const key = raw.svgAssetKey;
  if (typeof key !== "string" || key.length === 0) return null;
  const url = typeof raw.svgAssetUrl === "string" ? raw.svgAssetUrl : "";
  return { key, url };
}

function isSvgPlacementObject(obj: FabricObject): obj is Group {
  return obj instanceof Group && readSvgPlacementMeta(obj) !== null;
}

function fabricToYjs(obj: FabricObject): SvgPlacementYjsProps {
  const meta = readSvgPlacementMeta(obj);
  if (!meta) {
    throw new Error("fabricToYjsSvg: not a svg placement");
  }
  const group = obj as Group;
  const snapshot = group.toObject() as unknown as Record<string, unknown>;
  snapshot.svgAssetKey = meta.key;
  snapshot.svgAssetUrl = meta.url;
  return {
    svgAssetKey: meta.key,
    svgAssetUrl: meta.url,
    left: obj.left ?? 0,
    top: obj.top ?? 0,
    scaleX: obj.scaleX ?? 1,
    scaleY: obj.scaleY ?? 1,
    angle: obj.angle ?? 0,
    skewX: obj.skewX ?? 0,
    skewY: obj.skewY ?? 0,
    opacity: obj.opacity ?? 1,
    flipX: !!obj.flipX,
    flipY: !!obj.flipY,
    visible: obj.visible !== false,
    fabricSnapshot: snapshot,
  };
}

function applySvgPlacementTransform(
  group: Group,
  props: SvgPlacementYjsProps,
): void {
  group.set(
    Object.fromEntries(
      SVG_PLACEMENT_TRANSFORM_KEYS.map((k) => [k, props[k]]),
    ),
  );
  group.set({
    svgAssetKey: props.svgAssetKey,
    svgAssetUrl: props.svgAssetUrl,
  });
  group.setCoords();
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

function getSvgPlacementId(obj: FabricObject): string {
  let id = yjsIdMap.get(obj);
  if (!id) {
    id = generateId();
    yjsIdMap.set(obj, id);
  }
  return id;
}

function setSvgPlacementId(obj: FabricObject, id: string): void {
  yjsIdMap.set(obj, id);
}

function findFabricSvgPlacementById(
  canvas: Canvas,
  yjsId: string,
): Group | undefined {
  return canvas.getObjects().find(
    (obj): obj is Group =>
      isSvgPlacementObject(obj) && yjsIdMap.get(obj) === yjsId,
  );
}

/**
 * 登録 SVG（Group + svgAssetKey）と Y.Map("svgPlacements") の双方向同期（A 案: 参照 + 変形）。
 */
export function useYjsSvgPlacementSync(
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

    const ySvg = yDoc.getMap<SvgPlacementYjsProps>("svgPlacements");

    const handleObjectModified = (e: { target?: FabricObject }) => {
      if (isApplyingRemote(depthRef) || !e.target || !isSvgPlacementObject(e.target)) return;
      const id = getSvgPlacementId(e.target);
      ySvg.set(id, fabricToYjs(e.target));
    };

    const handleObjectAdded = (e: { target?: FabricObject }) => {
      if (isApplyingRemote(depthRef) || !e.target || !isSvgPlacementObject(e.target)) return;
      const id = getSvgPlacementId(e.target);
      if (!ySvg.has(id)) {
        ySvg.set(id, fabricToYjs(e.target));
      }
    };

    const handleObjectRemoved = (e: { target?: FabricObject }) => {
      if (isApplyingRemote(depthRef) || !e.target || !isSvgPlacementObject(e.target)) return;
      const id = getSvgPlacementId(e.target);
      if (ySvg.has(id)) {
        ySvg.delete(id);
      }
    };

    const observer = (event: Y.YMapEvent<SvgPlacementYjsProps>) => {
      event.keys.forEach((change, key) => {
        switch (change.action) {
          case "add": {
            const props = ySvg.get(key);
            if (!props) break;
            if (findFabricSvgPlacementById(canvas, key)) break;
            if (!props.svgAssetUrl) {
              console.warn(
                "[useYjsSvgPlacementSync] skip add: missing svgAssetUrl for key",
                key,
              );
              break;
            }
            void (async () => {
              depthRef.current += 1;
              try {
                const group = await loadSvgGroupUnscaled(props.svgAssetUrl);
                const c = fabricRef.current?.getCanvas();
                if (!group || !c) return;
                applySvgPlacementTransform(group, props);
                setSvgPlacementId(group, key);
                c.add(group);
                c.requestRenderAll();
              } catch (err) {
                console.warn("[useYjsSvgPlacementSync] failed to load SVG", err);
              } finally {
                depthRef.current -= 1;
              }
            })();
            break;
          }
          case "update": {
            const props = ySvg.get(key);
            if (!props) break;
            const existing = findFabricSvgPlacementById(canvas, key);
            if (!existing) break;

            const prevUrl = readSvgPlacementMeta(existing)?.url ?? "";
            const urlChanged =
              props.svgAssetUrl !== "" && props.svgAssetUrl !== prevUrl;

            if (urlChanged) {
              void (async () => {
                depthRef.current += 1;
                try {
                  const group = await loadSvgGroupUnscaled(props.svgAssetUrl);
                  const c = fabricRef.current?.getCanvas();
                  if (!group || !c) return;
                  applySvgPlacementTransform(group, props);
                  setSvgPlacementId(group, key);
                  c.remove(existing);
                  c.add(group);
                  c.requestRenderAll();
                } catch (err) {
                  console.warn(
                    "[useYjsSvgPlacementSync] failed to reload SVG on update",
                    err,
                  );
                } finally {
                  depthRef.current -= 1;
                }
              })();
            } else {
              depthRef.current += 1;
              try {
                applySvgPlacementTransform(existing, props);
                canvas.requestRenderAll();
              } finally {
                depthRef.current -= 1;
              }
            }
            break;
          }
          case "delete": {
            const existing = findFabricSvgPlacementById(canvas, key);
            if (existing) {
              depthRef.current += 1;
              try {
                canvas.remove(existing);
                canvas.requestRenderAll();
              } finally {
                depthRef.current -= 1;
              }
            }
            break;
          }
        }
      });
    };

    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:added", handleObjectAdded);
    canvas.on("object:removed", handleObjectRemoved);
    ySvg.observe(observer);

    renderYjsSvgPlacementsToCanvas(canvas, ySvg, fabricRef, depthRef);

    return () => {
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:added", handleObjectAdded);
      canvas.off("object:removed", handleObjectRemoved);
      ySvg.unobserve(observer);
    };
  }, [yDoc, fabricRef, enabled, remoteApplyDepthRef]); // eslint-disable-line react-hooks/exhaustive-deps -- depthRef
}

function renderYjsSvgPlacementsToCanvas(
  canvas: Canvas,
  ySvg: Y.Map<SvgPlacementYjsProps>,
  fabricRef: React.RefObject<FabricCanvasHandle | null>,
  depthRef: React.MutableRefObject<number>,
): void {
  if (ySvg.size === 0) return;
  ySvg.forEach((props, key) => {
    if (findFabricSvgPlacementById(canvas, key)) return;
    if (!props.svgAssetUrl) return;
    void (async () => {
      depthRef.current += 1;
      try {
        const group = await loadSvgGroupUnscaled(props.svgAssetUrl);
        const c = fabricRef.current?.getCanvas();
        if (!group || !c) return;
        applySvgPlacementTransform(group, props);
        setSvgPlacementId(group, key);
        c.add(group);
        c.requestRenderAll();
      } catch (err) {
        console.warn("[useYjsSvgPlacementSync] initial render SVG failed", err);
      } finally {
        depthRef.current -= 1;
      }
    })();
  });
}
