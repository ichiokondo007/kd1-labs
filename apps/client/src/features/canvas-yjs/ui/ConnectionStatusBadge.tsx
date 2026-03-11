import type { FC } from "react";
import { Badge } from "@/components/badge";
import type { ConnectionStatus } from "../hooks/useYjsConnection";

type Props = {
  status: ConnectionStatus;
  synced: boolean;
};

const STATUS_CONFIG = {
  connected: { color: "emerald", label: "Connected" },
  connecting: { color: "amber", label: "Connecting..." },
  disconnected: { color: "red", label: "Disconnected" },
} as const;

export const ConnectionStatusBadge: FC<Props> = ({ status, synced }) => {
  const config = STATUS_CONFIG[status];
  const label =
    status === "connected" && synced ? "Synced" : config.label;

  return <Badge color={config.color}>{label}</Badge>;
};
