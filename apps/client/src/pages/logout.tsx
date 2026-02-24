import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/services/meApi";

/**
 * /logout 表示時: API でセッション破棄 → /login へ遷移
 */
export default function LogoutPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Logging out...");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await logout();
        if (!cancelled) navigate("/login", { replace: true });
      } catch {
        if (!cancelled) setMessage("Logout failed. Redirecting...");
        if (!cancelled) setTimeout(() => navigate("/login", { replace: true }), 1500);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}
