import { useCallback, useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { LOCAL_EDIT_ORIGIN } from "@/features/canvas-yjs/domain";

export interface YjsUndoManagerResult {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

function syncButtons(um: Y.UndoManager, setCanUndo: (v: boolean) => void, setCanRedo: (v: boolean) => void) {
  setCanUndo(um.canUndo());
  setCanRedo(um.canRedo());
}

/**
 * Y.Map("objects") のローカル編集のみを Y.UndoManager で Undo/Redo。
 * trackedOrigins は LOCAL_EDIT_ORIGIN のみ（y-websocket 等のリモート origin は対象外）。
 */
export function useYjsUndoManager(
  yDoc: Y.Doc | null,
  canvasId: string | undefined,
  enabled: boolean,
): YjsUndoManagerResult {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const umRef = useRef<Y.UndoManager | null>(null);
  const prevCanvasIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!yDoc || !enabled) {
      umRef.current?.destroy();
      umRef.current = null;
      queueMicrotask(() => {
        setCanUndo(false);
        setCanRedo(false);
      });
      return;
    }

    const yObjects = yDoc.getMap("objects");
    const um = new Y.UndoManager(yObjects, {
      trackedOrigins: new Set([LOCAL_EDIT_ORIGIN]),
    });
    umRef.current = um;
    queueMicrotask(() => {
      syncButtons(um, setCanUndo, setCanRedo);
    });

    const onStackChange = () => {
      syncButtons(um, setCanUndo, setCanRedo);
    };

    um.on("stack-item-added", onStackChange);
    um.on("stack-item-popped", onStackChange);
    um.on("stack-item-updated", onStackChange);
    um.on("stack-cleared", onStackChange);

    return () => {
      um.off("stack-item-added", onStackChange);
      um.off("stack-item-popped", onStackChange);
      um.off("stack-item-updated", onStackChange);
      um.off("stack-cleared", onStackChange);
      um.destroy();
      if (umRef.current === um) {
        umRef.current = null;
      }
    };
  }, [yDoc, enabled]);

  useEffect(() => {
    if (canvasId === undefined) return;
    const prev = prevCanvasIdRef.current;
    prevCanvasIdRef.current = canvasId;
    if (prev !== undefined && prev !== canvasId) {
      umRef.current?.clear();
      const um = umRef.current;
      if (um) {
        queueMicrotask(() => {
          syncButtons(um, setCanUndo, setCanRedo);
        });
      }
    }
  }, [canvasId]);

  const undo = useCallback(() => {
    const um = umRef.current;
    if (!um) return;
    um.undo();
    syncButtons(um, setCanUndo, setCanRedo);
  }, []);

  const redo = useCallback(() => {
    const um = umRef.current;
    if (!um) return;
    um.redo();
    syncButtons(um, setCanUndo, setCanRedo);
  }, []);

  return { undo, redo, canUndo, canRedo };
}
