import { useEffect, useState, type FC } from "react";
import type { WebsocketProvider } from "y-websocket";
import { UserAvatar, type UserAvatarUser } from "@/components/user-avatar";

interface AwarenessUser {
  userId: string;
  name: string;
  avatarUrl: string | null;
  avatarColor: string;
}

type Props = {
  provider: WebsocketProvider | null;
};

export const ConnectedUsers: FC<Props> = ({ provider }) => {
  const [users, setUsers] = useState<AwarenessUser[]>([]);

  useEffect(() => {
    if (!provider) return;

    const awareness = provider.awareness;

    const update = () => {
      const states = awareness.getStates();
      const localClientId = provider.doc.clientID;
      const connected: AwarenessUser[] = [];

      states.forEach((state, clientId) => {
        if (clientId === localClientId) return;
        const u = state.user as AwarenessUser | undefined;
        if (u?.userId) connected.push(u);
      });
      setUsers(connected);
    };

    awareness.on("change", update);
    update();

    return () => {
      awareness.off("change", update);
    };
  }, [provider]);

  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-1">
        {users.length} online
      </span>
      <div className="flex -space-x-1.5">
        {users.map((u) => {
          const avatarUser: UserAvatarUser = {
            avatarUrl: u.avatarUrl,
            avatarColor: u.avatarColor,
            userName: u.name,
            screenName: u.name,
          };
          return (
            <UserAvatar
              key={u.userId}
              user={avatarUser}
              className="size-7 shrink-0 ring-2 ring-white dark:ring-zinc-900"
              title={u.name}
            />
          );
        })}
      </div>
    </div>
  );
};
