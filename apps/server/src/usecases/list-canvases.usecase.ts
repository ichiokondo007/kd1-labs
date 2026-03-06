import type { CanvasListItem } from "@kd1-labs/types";
import type { CanvasPort, UserLookupPort } from "../ports/canvas.port";

const UNKNOWN_USER = {
  screenName: "Unknown",
  avatarUrl: null,
  avatarColor: "zinc-400",
} as const;

export function makeListCanvasesUsecase(
  canvasPort: CanvasPort,
  userPort: UserLookupPort
) {
  return async function listCanvasesUsecase(): Promise<CanvasListItem[]> {
    const rows = await canvasPort.listCanvases();

    const uniqueUserIds = [...new Set(rows.map((r) => r.updatedBy))];
    const userMap = new Map<string, NonNullable<Awaited<ReturnType<UserLookupPort["findUserById"]>>>>();

    await Promise.all(
      uniqueUserIds.map(async (uid) => {
        const u = await userPort.findUserById(uid);
        if (u) userMap.set(uid, u);
      })
    );

    return rows
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .map((r) => ({
        id: r.id,
        canvasName: r.canvasName,
        canvasDescription: r.canvasDescription,
        thumbnailUrl: r.thumbnailUrl,
        updatedAt: r.updatedAt.toISOString(),
        updater: userMap.get(r.updatedBy) ?? UNKNOWN_USER,
      }));
  };
}
