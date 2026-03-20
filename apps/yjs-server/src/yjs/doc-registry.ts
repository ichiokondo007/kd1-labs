/**
 * Y.Doc シングルトン管理
 *
 * - canvasId ごとに Y.Doc を 1 つだけ保持
 * - Promise ベースの排他制御で同時接続時の重複を防止
 * - Persistence (bindState/writeState) との連携
 */
import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import * as syncProtocol from "y-protocols/sync";
import * as encoding from "lib0/encoding";
import type { WebSocket } from "ws";
import type {
  WSSharedDoc,
  Persistence,
  DocRegistry,
  DocInfo,
  UserInfo,
  PersistenceWriteMeta,
} from "./types.js";

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

// ── DocRegistry 実装 ─────────────────────────────────────────────────

export function createDocRegistry(): DocRegistry {
  const docs = new Map<string, { doc: WSSharedDoc; ready: Promise<void> }>();
  let persistence: Persistence | null = null;

  function createWSSharedDoc(name: string): WSSharedDoc {
    const doc = new Y.Doc({ gc: true }) as WSSharedDoc;
    doc.name = name;
    doc.conns = new Map();
    doc.connUserIds = new Map();
    doc.awareness = new awarenessProtocol.Awareness(doc);
    doc.awareness.setLocalState(null);

    // Awareness 変更を全クライアントに broadcast
    doc.awareness.on(
      "update",
      (
        { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
        conn: WebSocket | null,
      ) => {
        const changedClients = added.concat(updated, removed);
        if (conn !== null) {
          const controlledIDs = doc.conns.get(conn);
          if (controlledIDs !== undefined) {
            added.forEach((id) => controlledIDs.add(id));
            removed.forEach((id) => controlledIDs.delete(id));
          }
          // awareness に userId があれば conn → userId を記録
          for (const id of added.concat(updated)) {
            const state = doc.awareness.getStates().get(id) as
              | { user?: { userId?: string } }
              | undefined;
            const uid = state?.user?.userId;
            if (typeof uid === "string" && uid.length > 0) {
              doc.connUserIds.set(conn, uid);
              break;
            }
          }
        }
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
        encoding.writeVarUint8Array(
          encoder,
          awarenessProtocol.encodeAwarenessUpdate(doc.awareness, changedClients),
        );
        const message = encoding.toUint8Array(encoder);
        doc.conns.forEach((_ids, c) => broadcastToConn(doc, c, message));
      },
    );

    // Y.Doc の update を全クライアントに broadcast
    doc.on("update", (update: Uint8Array, _origin: unknown) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);
      doc.conns.forEach((_ids, conn) => broadcastToConn(doc, conn, message));
    });

    return doc;
  }

  function broadcastToConn(
    doc: WSSharedDoc,
    conn: WebSocket,
    message: Uint8Array,
  ): void {
    const WS_OPEN = 1;
    const WS_CONNECTING = 0;
    if (conn.readyState !== WS_CONNECTING && conn.readyState !== WS_OPEN) {
      return;
    }
    try {
      conn.send(message, (err) => {
        if (err != null) doc.conns.delete(conn);
      });
    } catch {
      doc.conns.delete(conn);
    }
  }

  const registry: DocRegistry = {
    hasDoc(docName: string): boolean {
      return docs.has(docName);
    },

    async getOrCreateDoc(docName: string): Promise<WSSharedDoc> {
      const existing = docs.get(docName);
      if (existing) {
        await existing.ready;
        return existing.doc;
      }

      const doc = createWSSharedDoc(docName);
      const ready =
        persistence !== null
          ? persistence.bindState(docName, doc)
          : Promise.resolve();

      docs.set(docName, { doc, ready });

      try {
        await ready;
      } catch (err) {
        docs.delete(docName);
        doc.destroy();
        throw err;
      }

      return doc;
    },

    listDocs(): DocInfo[] {
      return Array.from(docs.entries()).map(([docName, { doc }]) => ({
        docName,
        connectionCount: doc.conns.size,
      }));
    },

    getConnectedUsers(docName: string): UserInfo[] {
      const entry = docs.get(docName);
      if (!entry) return [];

      const states = entry.doc.awareness.getStates();
      const users: UserInfo[] = [];
      states.forEach((state, clientId) => {
        users.push({
          clientId,
          user: state.user as UserInfo["user"],
        });
      });
      return users;
    },

    async destroyDoc(
      docName: string,
      meta?: PersistenceWriteMeta,
    ): Promise<void> {
      const entry = docs.get(docName);
      if (!entry) return;

      if (persistence !== null) {
        await persistence.writeState(docName, entry.doc, meta);
      }
      entry.doc.destroy();
      docs.delete(docName);
    },

    setPersistence(p: Persistence | null): void {
      persistence = p;
    },
  };

  return registry;
}
