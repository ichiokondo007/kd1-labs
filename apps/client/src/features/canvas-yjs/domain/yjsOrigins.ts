/**
 * Fabric からのローカル編集を Y.Map に反映するときの transaction origin。
 * Y.UndoManager の trackedOrigins と一致させ、リモート同期由来の更新を Undo に含めない。
 */
export const LOCAL_EDIT_ORIGIN = Symbol("yjs-local-edit");
