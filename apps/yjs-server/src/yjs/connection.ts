/**
 * WebSocket 接続ハンドリング + Yjs Sync/Awareness プロトコル処理
 *
 * - SyncStep1/2/Update のエンコード・デコード
 * - Awareness update の送受信
 * - Ping/Pong によるヘルスチェック
 * - メッセージバッファリング（async 初期化中のメッセージ損失防止）
 */
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import type { WebSocket } from "ws";
import type { DocRegistry, WSSharedDoc, YjsServerHooks } from "./types.js";

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;
const DEFAULT_PING_TIMEOUT = 30_000;

export interface ConnectionOptions {
  registry: DocRegistry;
  hooks?: YjsServerHooks;
  pingTimeout?: number;
}

function messageListener(
  conn: WebSocket,
  doc: WSSharedDoc,
  message: Uint8Array,
): void {
  try {
    const encoder = encoding.createEncoder();
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case MESSAGE_SYNC:
        encoding.writeVarUint(encoder, MESSAGE_SYNC);
        syncProtocol.readSyncMessage(decoder, encoder, doc, null);
        if (encoding.length(encoder) > 1) {
          conn.send(encoding.toUint8Array(encoder));
        }
        break;
      case MESSAGE_AWARENESS:
        awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          decoding.readVarUint8Array(decoder),
          conn,
        );
        break;
    }
  } catch (err) {
    console.error("[yjs:message-error]", err);
    doc.emit("error", [err]);
  }
}

function sendSyncStep1(conn: WebSocket, doc: WSSharedDoc): void {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, MESSAGE_SYNC);
  syncProtocol.writeSyncStep1(encoder, doc);
  conn.send(encoding.toUint8Array(encoder));

  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(
        doc.awareness,
        Array.from(awarenessStates.keys()),
      ),
    );
    conn.send(encoding.toUint8Array(awarenessEncoder));
  }
}

/**
 * 当該 WS に紐づく awareness client ID から、removeAwarenessStates の前に userId を読む。
 * （消去後は状態が取れないため closeConn 内で削除前にのみ呼ぶ）
 */
function userIdFromAwarenessForConn(
  doc: WSSharedDoc,
  controlledIds: Set<number>,
): string | undefined {
  const states = doc.awareness.getStates();
  for (const id of controlledIds) {
    const state = states.get(id) as { user?: { userId?: string } } | undefined;
    const uid = state?.user?.userId;
    if (typeof uid === "string" && uid.length > 0) return uid;
  }
  return undefined;
}

function closeConn(
  doc: WSSharedDoc,
  conn: WebSocket,
  registry: DocRegistry,
  hooks?: YjsServerHooks,
): void {
  const controlledIds = doc.conns.get(conn);
  let lastDisconnectedUpdatedBy: string | undefined;
  if (controlledIds !== undefined) {
    if (doc.conns.size === 1) {
      lastDisconnectedUpdatedBy = userIdFromAwarenessForConn(
        doc,
        controlledIds,
      );
    }
    doc.conns.delete(conn);
    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null,
    );
  }

  hooks?.onConnectionClose?.(doc.name, conn, doc);

  if (doc.conns.size === 0) {
    void (async () => {
      try {
        await hooks?.onDocIdle?.(doc.name, doc);
        await registry.destroyDoc(
          doc.name,
          lastDisconnectedUpdatedBy !== undefined
            ? { updatedBy: lastDisconnectedUpdatedBy }
            : undefined,
        );
        console.log(`[yjs:doc-idle] doc="${doc.name}" destroyed`);
      } catch (err) {
        console.error(`[yjs:doc-idle-error] doc="${doc.name}"`, err);
      }
    })();
  }
}

export async function setupWSConnection(
  conn: WebSocket,
  docName: string,
  opts: ConnectionOptions,
): Promise<void> {
  const { registry, hooks, pingTimeout = DEFAULT_PING_TIMEOUT } = opts;

  conn.binaryType = "arraybuffer";

  // ── メッセージバッファリング（getOrCreateDoc 完了前のメッセージを保持）
  const messageBuffer: Uint8Array[] = [];
  const earlyMessageHandler = (raw: ArrayBuffer) => {
    messageBuffer.push(new Uint8Array(raw));
  };
  conn.on("message", earlyMessageHandler);

  let doc: WSSharedDoc;
  try {
    doc = await registry.getOrCreateDoc(docName);
  } catch (err) {
    console.error(`[yjs:init-error] doc="${docName}"`, err);
    conn.off("message", earlyMessageHandler);
    conn.close();
    return;
  }

  // ── 正式ハンドラに切り替え
  conn.off("message", earlyMessageHandler);
  conn.on("message", (raw: ArrayBuffer) => {
    const message = new Uint8Array(raw);
    const skip = hooks?.onMessage?.(docName, conn, message);
    if (skip === false) return;
    messageListener(conn, doc, message);
  });

  doc.conns.set(conn, new Set());

  // ── Ping/Pong ヘルスチェック
  let pongReceived = true;
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      hooks?.onPingTimeout?.(docName, conn, doc);
      closeConn(doc, conn, registry, hooks);
      conn.close();
      return;
    }
    if (conn.readyState !== 0 && conn.readyState !== 1) {
      closeConn(doc, conn, registry, hooks);
      return;
    }
    pongReceived = false;
    try {
      conn.ping();
    } catch {
      closeConn(doc, conn, registry, hooks);
      conn.close();
    }
  }, pingTimeout);

  conn.on("pong", () => {
    pongReceived = true;
  });

  conn.on("close", () => {
    clearInterval(pingInterval);
    closeConn(doc, conn, registry, hooks);
  });

  conn.on("error", (err: Error) => {
    hooks?.onError?.(docName, conn, err);
    closeConn(doc, conn, registry, hooks);
  });

  // ── SyncStep1 送信（サーバ → クライアント）
  sendSyncStep1(conn, doc);

  hooks?.onConnectionOpen?.(docName, conn, doc);

  // ── バッファに溜まったメッセージを処理（クライアントの SyncStep1 等）
  for (const msg of messageBuffer) {
    messageListener(conn, doc, msg);
  }
}
