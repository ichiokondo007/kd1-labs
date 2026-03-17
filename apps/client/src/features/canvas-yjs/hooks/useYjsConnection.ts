import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { User } from "@kd1-labs/types";

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

export interface YjsConnectionResult {
  yDoc: Y.Doc;
  provider: WebsocketProvider | null;
  connectionStatus: ConnectionStatus;
  synced: boolean;
}

function buildWsUrl(): string {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${location.host}/yjs`;
}

/**
 * Yjs WebSocket 接続を管理する hook。
 * canvasId を room 名として yjs-server に接続し、Awareness にユーザ情報をセットする。
 */
export function useYjsConnection(
  canvasId: string | undefined,
  user: User | null,
): YjsConnectionResult {
  const yDocRef = useRef<Y.Doc>(new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!canvasId) return;

    const doc = yDocRef.current;
    const wsProvider = new WebsocketProvider(buildWsUrl(), canvasId, doc, {
      connect: true,
    });

    const handleStatus = (e: { status: ConnectionStatus }) => {
      setConnectionStatus(e.status);
    };
    const handleSync = (isSynced: boolean) => {
      setSynced(isSynced);
    };

    wsProvider.on("status", handleStatus);
    wsProvider.on("sync", handleSync);

    // WebsocketProvider が既に synced 状態の場合（高速接続時）
    if (wsProvider.synced) {
      setSynced(true);
    }

    setProvider(wsProvider);

    return () => {
      wsProvider.off("status", handleStatus);
      wsProvider.off("sync", handleSync);
      wsProvider.destroy();
      setProvider(null);
      setConnectionStatus("disconnected");
      setSynced(false);
    };
  }, [canvasId]);

  useEffect(() => {
    if (!provider || !user) return;
    provider.awareness.setLocalStateField("user", {
      userId: user.userId,
      name: user.screenName,
      avatarUrl: user.avatarUrl,
      avatarColor: user.avatarColor,
    });
  }, [provider, user]);

  return {
    yDoc: yDocRef.current,
    provider,
    connectionStatus,
    synced,
  };
}
