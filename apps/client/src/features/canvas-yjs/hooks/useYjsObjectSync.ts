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
 * 全 Fabric オブジェクトと Y.Map("objects") の双方向同期。
 * オブジェクト種別を問わず fabricSnapshot (toObject() の完全 JSON) で統一的に扱う。
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
      if (!yObjects.has(id)) {
        yDoc.transact(() => {
          yObjects.set(id, fabricToYjs(target));
        }, LOCAL_EDIT_ORIGIN);
      }
    };

    const handleObjectRemoved = (e: { target?: FabricObject }) => {
      if (isApplyingRemote(depthRef)) return;
      const target = e.target;
      if (!target) return;
      const id = getObjectId(target);
      if (yObjects.has(id)) {
        yDoc.transact(() => {
          yObjects.delete(id);
        }, LOCAL_EDIT_ORIGIN);
      }
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

    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:added", handleObjectAdded);
    canvas.on("object:removed", handleObjectRemoved);
    yObjects.observe(observer);

    renderYjsObjectsToCanvas(canvas, yObjects, fabricRef, depthRef);

    return () => {
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:added", handleObjectAdded);
      canvas.off("object:removed", handleObjectRemoved);
      yObjects.unobserve(observer);
    };
  }, [yDoc, fabricRef, enabled, remoteApplyDepthRef]); // eslint-disable-line react-hooks/exhaustive-deps -- depthRef
}

function renderYjsObjectsToCanvas(
  canvas: Canvas,
  yObjects: Y.Map<ObjectYjsEntry>,
  fabricRef: React.RefObject<FabricCanvasHandle | null>,
  depthRef: React.MutableRefObject<number>,
): void {
  if (yObjects.size === 0) return;
  yObjects.forEach((entry, key) => {
    if (findFabricObjectById(canvas, key)) return;
    void (async () => {
      depthRef.current += 1;
      try {
        const obj = await snapshotToFabricObject(entry.fabricSnapshot);
        const c = fabricRef.current?.getCanvas();
        if (!obj || !c) return;
        setObjectId(obj, key);
        c.add(obj);
        c.requestRenderAll();
      } catch (err) {
        console.warn("[useYjsObjectSync] initial render failed", err);
      } finally {
        depthRef.current -= 1;
      }
    })();
  });
}
