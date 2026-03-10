import type { WebSocket } from "ws";
import type { Awareness } from "y-protocols/awareness";
import type { Doc } from "yjs";

export interface WSSharedDoc extends Doc {
  name: string;
  conns: Map<WebSocket, Set<number>>;
  awareness: Awareness;
}

export interface Persistence {
  bindState: (docName: string, doc: WSSharedDoc) => Promise<void>;
  writeState: (docName: string, doc: WSSharedDoc) => Promise<void>;
}
