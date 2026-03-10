import type { FC } from "react";
import { Badge } from "@/components/badge";
import type { CollabStatus } from "../types";
import { collabStatusLabel } from "../domain";

type Props = {
  status: CollabStatus;
  activeEditors: number;
};

const STATUS_COLOR = {
  ready: "emerald",
  none: "zinc",
} as const;

export const CollabStatusBadge: FC<Props> = ({ status, activeEditors }) => {
  const label = collabStatusLabel(status, activeEditors);
  if (!label) return null;

  return <Badge color={STATUS_COLOR[status]}>{label}</Badge>;
};
