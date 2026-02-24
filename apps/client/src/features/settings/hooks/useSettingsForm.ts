import { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { patchMe } from "@/services/meApi";
import type { SettingsPageFormProps } from "../types";
import { AVATAR_COLOR_PALETTE } from "../types";
import { getRequiredUserNameError } from "../domain";
import { isAxiosError } from "axios";

/**
 * プロフィール設定フォーム用 hook。
 * 現在ユーザーで初期化し、必須チェック・保存処理を担当する。
 */
export function useSettingsForm(): SettingsPageFormProps & { isLoading: boolean } {
  const { user, isLoading: userLoading, refetch } = useCurrentUser();
  const [userName, setUserName] = useState("");
  const [avatarColor, setAvatarColor] = useState<string>(AVATAR_COLOR_PALETTE[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    setUserName(user.userName);
    const hex = user.avatarColor;
    if (hex && AVATAR_COLOR_PALETTE.includes(hex as (typeof AVATAR_COLOR_PALETTE)[number])) {
      setAvatarColor(hex);
    } else {
      setAvatarColor(AVATAR_COLOR_PALETTE[0]);
    }
  }, [user]);

  const requiredError = getRequiredUserNameError(userName);
  const errorMessage = requiredError ?? serverError;

  const onSave = useCallback(async () => {
    if (getRequiredUserNameError(userName)) return;
    setServerError(undefined);
    setIsSaving(true);
    try {
      await patchMe({ userName: userName.trim(), avatarColor });
      await refetch();
    } catch (e) {
      const message = isAxiosError(e) && e.response?.data?.error?.message
        ? String(e.response.data.error.message)
        : "Failed to save.";
      setServerError(message);
    } finally {
      setIsSaving(false);
    }
  }, [userName, avatarColor, refetch]);

  return {
    userName,
    avatarColor,
    onUserNameChange: setUserName,
    onAvatarColorChange: setAvatarColor,
    onSave,
    isSaving,
    errorMessage,
    isLoading: userLoading,
  };
}
