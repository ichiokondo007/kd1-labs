/**
 * ユーザー一覧取得ユースケース
 * Port 経由で一覧を取得し、クライアント用の形式（id, role）に変換する
 */
import type { UsersPort } from "../ports/users.port";

/** クライアントの UsersItem に合わせた形式 */
export interface ListUsersOutputItem {
  id: string;
  userName: string;
  screenName: string;
  role: string;
  avatarUrl: string | null;
  avatarColor: string;
}

function toRole(isAdmin: boolean): string {
  return isAdmin ? "Admin" : "Viewer";
}

export function makeListUsersUsecase(usersPort: UsersPort) {
  return async function listUsersUsecase(): Promise<ListUsersOutputItem[]> {
    const rows = await usersPort.listUsers();
    return rows.map((r) => ({
      id: r.userId,
      userName: r.userName,
      screenName: r.screenName,
      role: toRole(r.isAdmin),
      avatarUrl: r.avatarUrl,
      avatarColor: r.avatarColor,
    }));
  };
}
