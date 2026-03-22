/**
 * KD1 固有のライフサイクルフック実装
 *
 * YjsServerHooks インターフェースに準拠し、
 * KD1 のビジネスロジック（認証、ログ、メトリクス、エラーハンドリング等）を提供する。
 */
import type { WebSocket } from "ws";
import type { IncomingMessage } from "node:http";
import type { YjsServerHooks, WSSharedDoc, AuthResult } from "../yjs/types.js";
import {
  activeDocsGauge,
  activeConnectionsGauge,
} from "../yjs/metrics.js";

export function createKd1Hooks(): YjsServerHooks {
  return {
    async authCheck(_req: IncomingMessage): Promise<AuthResult> {
      // Phase 2 で JWT / session 検証を実装予定
      return { ok: true };
    },

    onConnectionOpen(
      docName: string,
      _conn: WebSocket,
      doc: WSSharedDoc,
    ): void {
      activeConnectionsGauge.inc();
      if (doc.conns.size === 1) {
        activeDocsGauge.inc();
      }
      console.log(
        `[kd1:conn-open] doc="${docName}" connections=${doc.conns.size}`,
      );
    },

    onConnectionClose(
      docName: string,
      _conn: WebSocket,
      doc: WSSharedDoc,
    ): void {
      activeConnectionsGauge.dec();
      console.log(
        `[kd1:conn-close] doc="${docName}" remaining=${doc.conns.size}`,
      );
    },

    onPingTimeout(
      docName: string,
      _conn: WebSocket,
      _doc: WSSharedDoc,
    ): void {
      console.warn(`[kd1:ping-timeout] doc="${docName}" — closing connection`);
    },

    onError(docName: string, _conn: WebSocket, error: Error): void {
      console.error(`[kd1:ws-error] doc="${docName}"`, error.message);
    },

    async onDocIdle(docName: string, _doc: WSSharedDoc): Promise<void> {
      activeDocsGauge.dec();
      console.log(
        `[kd1:doc-idle] doc="${docName}" — 0 connections, persisting...`,
      );
    },
  };
}
