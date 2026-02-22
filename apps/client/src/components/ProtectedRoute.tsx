import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/**
 * セッション（/api/me）がある場合のみ子ルートを表示し、
 * 未ログインの場合は /login へリダイレクトする。
 * App.tsx でダッシュボード系ルートをラップして利用する。
 */
export function ProtectedRoute() {
  const { user, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <span className="text-sm text-zinc-500">Loading...</span>
      </div>
    );
  }

  if (error || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
