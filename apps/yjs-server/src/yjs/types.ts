import type { WebSocket } from "ws";
import type { IncomingMessage } from "node:http";
import type { Awareness } from "y-protocols/awareness";
import type { Doc } from "yjs";

// ── Y.Doc 拡張型 ────────────────────────────────────────────────────

export interface WSSharedDoc extends Doc {
  name: string;
  conns: Map<WebSocket, Set<number>>;
  awareness: Awareness;
  /** conn → userId マッピング（awareness 消去後も参照可能にするため） */
  connUserIds: Map<WebSocket, string>;
}

// ── Persistence（SSOT 永続化） ──────────────────────────────────────

/** writeState / destroyDoc から永続化層へ渡す付帯情報 */
export interface PersistenceWriteMeta {
  updatedBy?: string;
}

export interface Persistence {
  /** MongoDB 等から Y.Doc にデータを展開する */
  bindState(docName: string, doc: WSSharedDoc): Promise<void>;
  /** Y.Doc のデータを MongoDB 等に保存する */
  writeState(
    docName: string,
    doc: WSSharedDoc,
    meta?: PersistenceWriteMeta,
  ): Promise<void>;
}

// ── 認証結果 ─────────────────────────────────────────────────────────

export interface AuthResult {
  ok: boolean;
  userId?: string;
  reason?: string;
}

// ── ライフサイクルフック（ビジネスロジック注入点） ────────────────────

export interface YjsServerHooks {
  /** WS 接続確立時の認証・認可。false を返すと接続を拒否する */
  authCheck?(req: IncomingMessage): Promise<AuthResult>;

  /** connection 確立後のフック（ログ、メトリクス等） */
  onConnectionOpen?(docName: string, conn: WebSocket, doc: WSSharedDoc): void;

  /** connection 切断時のフック */
  onConnectionClose?(docName: string, conn: WebSocket, doc: WSSharedDoc): void;

  /** メッセージ受信時のフック（プロトコル処理前）。false を返すと標準処理をスキップ */
  onMessage?(docName: string, conn: WebSocket, message: Uint8Array): boolean;

  /** Ping/Pong タイムアウト時のフック */
  onPingTimeout?(docName: string, conn: WebSocket, doc: WSSharedDoc): void;

  /** WS エラー時のフック */
  onError?(docName: string, conn: WebSocket, error: Error): void;

  /** Y.Doc の参加者が 0 人になった時のフック（persistence 発火前） */
  onDocIdle?(docName: string, doc: WSSharedDoc): Promise<void>;
}

// ── DocRegistry 公開 API ─────────────────────────────────────────────

export interface DocInfo {
  docName: string;
  connectionCount: number;
}

export interface UserInfo {
  clientId: number;
  user?: { userId: string; name: string; avatarUrl?: string };
}

export interface DocRegistry {
  /** canvasId の Y.Doc がサーバ上に存在するか */
  hasDoc(docName: string): boolean;

  /** Y.Doc を取得（なければ SSOT から復元 + 排他制御） */
  getOrCreateDoc(docName: string): Promise<WSSharedDoc>;

  /** サーバ上の全 Y.Doc 一覧 */
  listDocs(): DocInfo[];

  /** docName に参加しているユーザ一覧 */
  getConnectedUsers(docName: string): UserInfo[];

  /** Y.Doc を明示的に破棄（persistence.writeState 後） */
  destroyDoc(
    docName: string,
    meta?: PersistenceWriteMeta,
  ): Promise<void>;

  /** Persistence を設定する */
  setPersistence(p: Persistence | null): void;
}

// ── YjsServer 設定 ──────────────────────────────────────────────────

export interface YjsServerConfig {
  host?: string;
  port?: number;
  persistence?: Persistence;
  hooks?: YjsServerHooks;
  pingTimeout?: number;
}
