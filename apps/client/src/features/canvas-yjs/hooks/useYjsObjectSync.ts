import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { util, type Canvas, type FabricObject } from "fabric";
import type { FabricCanvasHandle } from "@/features/canvas/ui/FabricCanvas";
import { generateId } from "@/features/canvas/domain";
import { LOCAL_EDIT_ORIGIN } from "@/features/canvas-yjs/domain";
import { isApplyingRemote } from "./collabRemoteDepth";

interface ObjectYjsEntry {
  fabricSnapshot: Record<string, unknown>;
}

function fabricToYjs(obj: FabricObject): ObjectYjsEntry {
  return {
    fabricSnapshot: obj.toObject() as unknown as Record<string, unknown>,
  };
}

function toPlainObject(value: unknown): unknown {
  if (value == null) return value;
  if (
    typeof value === "object" &&
    "toJSON" in value &&
    typeof (value as { toJSON: unknown }).toJSON === "function"
  ) {
    return (value as { toJSON: () => unknown }).toJSON();
  }
  return value;
}

async function snapshotToFabricObject(
  snapshot: Record<string, unknown>,
): Promise<FabricObject | null> {
  const plain = toPlainObject(snapshot) as Record<string, unknown>;
  const objects = await util.enlivenObjects<FabricObject>([plain]);
  return objects[0] ?? null;
}

const yjsIdMap = new WeakMap<FabricObject, string>();

function getObjectId(obj: FabricObject): string {
  let id = yjsIdMap.get(obj);
  if (!id) {
    const raw = obj as FabricObject & { yjsId?: unknown };
    if (typeof raw.yjsId === "string" && raw.yjsId.length > 0) {
      id = raw.yjsId;
    } else {
      id = generateId();
    }
    yjsIdMap.set(obj, id);
  }
  return id;
}

function setObjectId(obj: FabricObject, id: string): void {
  yjsIdMap.set(obj, id);
}

function findFabricObjectById(
  canvas: Canvas,
  yjsId: string,
): FabricObject | undefined {
  return canvas.getObjects().find((obj) => yjsIdMap.get(obj) === yjsId);
}

/**
 * 全 Fabric オブジェクトと Y.Map("objects") + Y.Array("order") の双方向同期。
 *
 * - 属性の真実: Y.Map<ObjectYjsEntry>("objects")
 * - 並びの真実: Y.Array<string>("order") (末尾 = 前面 / 先頭 = 背面)
 *
 * 追加・削除は属性と並びを 1 transact にまとめ、CRDT の整合性を保つ。
 */
export function useYjsObjectSync(
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

    const yObjects = yDoc.getMap<ObjectYjsEntry>("objects");
    const yOrder = yDoc.getArray<string>("order");

    if (yObjects.size > 0 && yOrder.length === 0) {
      yDoc.transact(() => {
        yOrder.push(Array.from(yObjects.keys()));
      }, LOCAL_EDIT_ORIGIN);
    }

    const handleObjectModified = (e: { target?: FabricObject }) => {
      if (isApplyingRemote(depthRef)) return;
      const target = e.target;
      if (!target) return;
      const id = getObjectId(target);
      yDoc.transact(() => {
        yObjects.set(id, fabricToYjs(target));
      }, LOCAL_EDIT_ORIGIN);
    };

    const handleObjectAdded = (e: { target?: FabricObject }) => {
      if (isApplyingRemote(depthRef)) return;
      const target = e.target;
      if (!target) return;
      const id = getObjectId(target);
      if (yObjects.has(id)) return;
      yDoc.transact(() => {
        yObjects.set(id, fabricToYjs(target));
        yOrder.push([id]);
      }, LOCAL_EDIT_ORIGIN);
    };

    const handleObjectRemoved = (e: { target?: FabricObject }) => {
      if (isApplyingRemote(depthRef)) return;
      const target = e.target;
      if (!target) return;
      const id = getObjectId(target);
      if (!yObjects.has(id)) return;
      yDoc.transact(() => {
        yObjects.delete(id);
        const idx = yOrder.toArray().indexOf(id);
        if (idx >= 0) yOrder.delete(idx, 1);
      }, LOCAL_EDIT_ORIGIN);
    };

    const placeAtOrderIndex = (c: Canvas, obj: FabricObject, key: string) => {
      const idx = yOrder.toArray().indexOf(key);
      if (idx >= 0) c.moveObjectTo(obj, idx);
    };

    const observer = (event: Y.YMapEvent<ObjectYjsEntry>) => {
      event.keys.forEach((change, key) => {
        switch (change.action) {
          case "add": {
            const entry = yObjects.get(key);
            if (!entry) break;
            if (findFabricObjectById(canvas, key)) break;
            void (async () => {
              depthRef.current += 1;
              try {
                const obj = await snapshotToFabricObject(
                  entry.fabricSnapshot,
                );
                const c = fabricRef.current?.getCanvas();
                if (!obj || !c) return;
                setObjectId(obj, key);
                c.add(obj);
                placeAtOrderIndex(c, obj, key);
                c.requestRenderAll();
              } catch (err) {
                console.warn(
                  "[useYjsObjectSync] failed to restore object",
                  err,
                );
              } finally {
                depthRef.current -= 1;
              }
            })();
            break;
          }
          case "update": {
            const entry = yObjects.get(key);
            if (!entry) break;
            const existing = findFabricObjectById(canvas, key);
            if (!existing) break;
            void (async () => {
              depthRef.current += 1;
              try {
                const obj = await snapshotToFabricObject(
                  entry.fabricSnapshot,
                );
                const c = fabricRef.current?.getCanvas();
                if (!obj || !c) return;
                setObjectId(obj, key);
                c.remove(existing);
                c.add(obj);
                placeAtOrderIndex(c, obj, key);
                c.requestRenderAll();
              } catch (err) {
                console.warn(
                  "[useYjsObjectSync] failed to update object",
                  err,
                );
              } finally {
                depthRef.current -= 1;
              }
            })();
            break;
          }
          case "delete": {
            const existing = findFabricObjectById(canvas, key);
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

    const orderObserver = () => {
      const c = fabricRef.current?.getCanvas();
      if (!c) return;
      const ids = yOrder.toArray();
      depthRef.current += 1;
      try {
        ids.forEach((id, index) => {
          const obj = findFabricObjectById(c, id);
          if (obj) c.moveObjectTo(obj, index);
        });
        c.requestRenderAll();
      } finally {
        depthRef.current -= 1;
      }
    };

    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:added", handleObjectAdded);
    canvas.on("object:removed", handleObjectRemoved);
    yObjects.observe(observer);
    yOrder.observe(orderObserver);

    void renderYjsObjectsToCanvas(canvas, yObjects, yOrder, fabricRef, depthRef);

    return () => {
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:added", handleObjectAdded);
      canvas.off("object:removed", handleObjectRemoved);
      yObjects.unobserve(observer);
      yOrder.unobserve(orderObserver);
    };
  }, [yDoc, fabricRef, enabled, remoteApplyDepthRef]); // eslint-disable-line react-hooks/exhaustive-deps -- depthRef
}

async function renderYjsObjectsToCanvas(
  canvas: Canvas,
  yObjects: Y.Map<ObjectYjsEntry>,
  yOrder: Y.Array<string>,
  fabricRef: React.RefObject<FabricCanvasHandle | null>,
  depthRef: React.MutableRefObject<number>,
): Promise<void> {
  const ids =
    yOrder.length > 0 ? yOrder.toArray() : Array.from(yObjects.keys());
  if (ids.length === 0) return;

  for (const key of ids) {
    if (findFabricObjectById(canvas, key)) continue;
    const entry = yObjects.get(key);
    if (!entry) continue;
    depthRef.current += 1;
    try {
      const obj = await snapshotToFabricObject(entry.fabricSnapshot);
      const c = fabricRef.current?.getCanvas();
      if (!obj || !c) continue;
      setObjectId(obj, key);
      c.add(obj);
    } catch (err) {
      console.warn("[useYjsObjectSync] initial render failed", err);
    } finally {
      depthRef.current -= 1;
    }
  }
  fabricRef.current?.getCanvas()?.requestRenderAll();
}
