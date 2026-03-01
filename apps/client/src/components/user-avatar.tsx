import { useState, useEffect, type FC } from "react";
import { Avatar } from "@/components/avatar";

/**
 * User テーブル由来の表示用データ（GET /api/me の User や一覧の UsersItem など）
 */
export type UserAvatarUser = {
  avatarUrl?: string | null;
  avatarColor?: string;
  userName: string;
  screenName?: string;
};

export type UserAvatarProps = {
  user: UserAvatarUser;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<"span">, "className">;

/** avatarColor が Tailwind 名のときの背景クラス（hex の場合は style で指定） */
const AVATAR_BG: Record<string, string> = {
  "zinc-900": "bg-zinc-900 text-white",
  "zinc-800": "bg-zinc-800 text-white",
  "blue-600": "bg-blue-600 text-white",
  "indigo-600": "bg-indigo-600 text-white",
};

function isHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{3,8}$/.test(value);
}

function nameToInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  return trimmed.slice(0, 2).toUpperCase();
}

/**
 * User テーブル由来のデータからアバターを表示する共通コンポーネント。
 * - avatarUrl がある場合: 画像を表示（読み込み失敗時は NickName 2文字＋DB色にフォールバック）
 * - ない場合: avatarColor で背景色＋NickName 2文字を表示
 */
export const UserAvatar: FC<UserAvatarProps> = ({ user, className, ...props }) => {
  const [imageError, setImageError] = useState(false);
  const displayName = user.screenName ?? user.userName;
  const initials = nameToInitials(displayName);

  /** avatarUrl が変わったらエラー状態をリセット（クロップ後の新しい画像を表示するため） */
  useEffect(() => {
    setImageError(false);
  }, [user.avatarUrl]);

  const sizeClass = className ?? "size-9 shrink-0";
  const showImage = user.avatarUrl && !imageError;

  if (showImage) {
    return (
      <Avatar
        src={user.avatarUrl}
        alt={displayName}
        className={sizeClass}
        onError={() => setImageError(true)}
        {...props}
      />
    );
  }

  const color = user.avatarColor ?? "zinc-900";
  const useHex = isHexColor(color);
  const bgClass = useHex ? undefined : (AVATAR_BG[color] ?? AVATAR_BG["zinc-900"]);
  const bgStyle = useHex ? { backgroundColor: color } : undefined;

  return (
    <span
      className={
        bgClass
          ? `inline-flex shrink-0 items-center justify-center rounded-full ${bgClass} text-xs font-medium ${sizeClass}`
          : `inline-flex shrink-0 items-center justify-center rounded-full text-xs font-medium text-white ${sizeClass}`
      }
      style={bgStyle}
      {...props}
    >
      <Avatar initials={initials} alt={displayName} className="size-full" />
    </span>
  );
};
