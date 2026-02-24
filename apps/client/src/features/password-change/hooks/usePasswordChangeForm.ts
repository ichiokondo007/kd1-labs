import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "@/services/meApi";
import { validatePasswordChangeForm } from "../domain";
import { postPasswordChange } from "../services";

/**
 * パスワード変更フォーム用 hook
 * - 現在ユーザー名は GET /api/me で取得
 * - 送信時は domain で検証 → POST /api/me/password → 成功時 /home へ遷移
 */
export function usePasswordChangeForm() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await getMe();
        if (!cancelled) setUserName(user.userName);
      } catch {
        if (!cancelled) setErrorMessage("Failed to load user.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSave = useCallback(async () => {
    setErrorMessage(undefined);
    const validation = validatePasswordChangeForm(newPassword, confirmPassword);
    if (!validation.ok) {
      setErrorMessage(validation.message);
      return;
    }
    setIsSaving(true);
    try {
      await postPasswordChange(newPassword);
      navigate("/home", { replace: true });
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Failed to change password.");
    } finally {
      setIsSaving(false);
    }
  }, [newPassword, confirmPassword, navigate]);

  return {
    userName,
    newPassword,
    confirmPassword,
    onNewPasswordChange: setNewPassword,
    onConfirmPasswordChange: setConfirmPassword,
    onSave,
    isLoading,
    isSaving,
    errorMessage,
  };
}
