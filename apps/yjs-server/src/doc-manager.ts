/**
 * Y.Doc シングルトン管理 + WebSocket 接続ハンドリング
 *
 * y-websocket v1.5.4
 * ref: https://github.com/yjs/y-websocket/blob
 */
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { WebSocket } from "ws";
import type { IncomingMessage } from "node:http";
import type { WSSharedDoc, Persistence } from "./types.js";

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

const WS_READY_STATE_CONNECTING = 0;
const WS_READY_STATE_OPEN = 1;

const PING_TIMEOUT = 30_000;

// ── Singleton docs map ──────────────────────────────────────────────
const docs = new Map<string, WSSharedDoc>();
let persistence: Persistence | null = null;

export function getDocs(): ReadonlyMap<string, WSSharedDoc> {
  return docs;
}

export function setPersistence(p: Persistence | null): void {
  persistence = p;
}

// ── WSSharedDoc factory ─────────────────────────────────────────────
function createWSSharedDoc(name: string): WSSharedDoc {
  const doc = new Y.Doc({ gc: true }) as WSSharedDoc;
  doc.name = name;
  doc.conns = new Map();
  doc.awareness = new awarenessProtocol.Awareness(doc);
  doc.awareness.setLocalState(null);

  // awareness 変更を全クライアントに broadcast
  doc.awareness.on(
    "update",
    ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }, conn: WebSocket | null) => {
      const changedClients = added.concat(updated, removed);
      if (conn !== null) {
        const controlledIDs = doc.conns.get(conn);
        if (controlledIDs !== undefined) {
          added.forEach((id) => controlledIDs.add(id));
          removed.forEach((id) => controlledIDs.delete(id));
        }
      }
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(doc.awareness, changedClients)
      );
      const message = encoding.toUint8Array(encoder);
      doc.conns.forEach((_ids, c) => send(doc, c, message));
    }
  );

  // Y.Doc の update を全クライアントに broadcast
  doc.on("update", (update: Uint8Array, _origin: unknown) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);
    doc.conns.forEach((_ids, conn) => send(doc, conn, message));
  });

  return doc;
}

// ── getYDoc (シングルトン) ───────────────────────────────────────────
function getYDoc(docName: string): WSSharedDoc {
  const existing = docs.get(docName);
  if (existing) return existing;

  const doc = createWSSharedDoc(docName);
  docs.set(docName, doc);

  if (persistence !== null) {
    persistence.bindState(docName, doc);
  }

  return doc;
}

// ── send ─────────────────────────────────────────────────────────────
function send(doc: WSSharedDoc, conn: WebSocket, message: Uint8Array): void {
  if (
    conn.readyState !== WS_READY_STATE_CONNECTING &&
    conn.readyState !== WS_READY_STATE_OPEN
  ) {
    closeConn(doc, conn);
    return;
  }
  try {
    conn.send(message, (err) => {
      if (err != null) closeConn(doc, conn);
    });
  } catch {
    closeConn(doc, conn);
  }
}

// ── closeConn ────────────────────────────────────────────────────────
function closeConn(doc: WSSharedDoc, conn: WebSocket): void {
  if (!doc.conns.has(conn)) return;

  const controlledIds = doc.conns.get(conn)!;
  doc.conns.delete(conn);
  awarenessProtocol.removeAwarenessStates(
    doc.awareness,
    Array.from(controlledIds),
    null
  );

  if (doc.conns.size === 0) {
    if (persistence !== null) {
      persistence.writeState(doc.name, doc).then(() => {
        doc.destroy();
      });
    } else {
      doc.destroy();
    }
    docs.delete(doc.name);
    console.log(`[doc:idle] "${doc.name}" — removed from memory`);
  }

  if (conn.readyState === WS_READY_STATE_OPEN || conn.readyState === WS_READY_STATE_CONNECTING) {
    conn.close();
  }
}

// ── messageListener ──────────────────────────────────────────────────
function messageListener(
  conn: WebSocket,
  doc: WSSharedDoc,
  message: Uint8Array
): void {
  try {
    const encoder = encoding.createEncoder();
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case MESSAGE_SYNC:
        encoding.writeVarUint(encoder, MESSAGE_SYNC);
        syncProtocol.readSyncMessage(decoder, encoder, doc, conn);
        if (encoding.length(encoder) > 1) {
          send(doc, conn, encoding.toUint8Array(encoder));
        }
        break;
      case MESSAGE_AWARENESS:
        awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          decoding.readVarUint8Array(decoder),
          conn
        );
        break;
    }
  } catch (err) {
    console.error(err);
  }
}

// ── setupWSConnection (公開API) ──────────────────────────────────────
export function setupWSConnection(
  conn: WebSocket,
  req: IncomingMessage,
  options: { docName?: string } = {}
): void {
  conn.binaryType = "arraybuffer";

  const docName =
    options.docName ?? req.url?.slice(1).split("?")[0] ?? "default";
  const doc = getYDoc(docName);
  doc.conns.set(conn, new Set());

  console.log(
    `[user:joined] doc="${docName}" connections=${doc.conns.size}`
  );

  // メッセージ受信
  conn.on("message", (message: ArrayBuffer) => {
    messageListener(conn, doc, new Uint8Array(message));
  });

  // Ping/Pong ヘルスチェック
  let pongReceived = true;
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        closeConn(doc, conn);
      }
      clearInterval(pingInterval);
    } else if (doc.conns.has(conn)) {
      pongReceived = false;
      try {
        conn.ping();
      } catch {
        closeConn(doc, conn);
        clearInterval(pingInterval);
      }
    }
  }, PING_TIMEOUT);

  conn.on("close", () => {
    closeConn(doc, conn);
    clearInterval(pingInterval);
    console.log(
      `[user:left] doc="${docName}" connections=${doc.conns.size}`
    );
  });

  conn.on("pong", () => {
    pongReceived = true;
  });

  conn.on("error", (err) => {
    console.warn(`[ws:error] doc="${docName}" ${err.message}`);
    closeConn(doc, conn);
    clearInterval(pingInterval);
  });

  // SyncStep1 を送信 → クライアントが SyncStep2 で応答
  {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    syncProtocol.writeSyncStep1(encoder, doc);
    send(doc, conn, encoding.toUint8Array(encoder));

    // 既存の awareness states を送信（途中参加対応）
    const awarenessStates = doc.awareness.getStates();
    if (awarenessStates.size > 0) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(
          doc.awareness,
          Array.from(awarenessStates.keys())
        )
      );
      send(doc, conn, encoding.toUint8Array(encoder));
    }
  }
}
