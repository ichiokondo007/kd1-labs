import { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { patchMe } from "@/services/meApi";
import { uploadFile } from "@/services/storageApi";
import type { SettingsPageFormHookResult } from "../types";
import { AVATAR_COLOR_PALETTE } from "../types";
import { getRequiredUserNameError, getRequiredScreenNameError } from "../domain";
import { isAxiosError } from "axios";

/**
 * プロフィール設定フォーム用 hook。
 * 現在ユーザーで初期化し、必須チェック・保存処理を担当する。
 */
export function useSettingsForm(): SettingsPageFormHookResult {
  const { user, isLoading: userLoading, refetch } = useCurrentUser();
  const [userName, setUserName] = useState("");
  const [screenName, setScreenName] = useState("");
  const [avatarColor, setAvatarColor] = useState<string>(AVATAR_COLOR_PALETTE[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    setUserName(user.userName);
    setScreenName(user.screenName);
    const hex = user.avatarColor;
    if (hex && AVATAR_COLOR_PALETTE.includes(hex as (typeof AVATAR_COLOR_PALETTE)[number])) {
      setAvatarColor(hex);
    } else {
      setAvatarColor(AVATAR_COLOR_PALETTE[0]);
    }
  }, [user]);

  const userNameError = getRequiredUserNameError(userName);
  const screenNameError = getRequiredScreenNameError(screenName);

  const onSave = useCallback(
    async (pendingAvatarDataUrl?: string | null) => {
      if (getRequiredUserNameError(userName) || getRequiredScreenNameError(screenName)) return;
      setServerError(undefined);
      setIsSaving(true);
      try {
        let avatarUrl: string | undefined;
        if (pendingAvatarDataUrl?.startsWith("data:")) {
          const url = await uploadFile(pendingAvatarDataUrl, "image/png");
          avatarUrl = url;
        } else {
          avatarUrl = user?.avatarUrl ?? undefined;
        }
        const updated = await patchMe({
          userName: userName.trim(),
          screenName: screenName.trim(),
          avatarColor,
          ...(avatarUrl !== undefined && { avatarUrl }),
        });
        if (updated) {
          refetch(updated);
        } else {
          await refetch();
        }
      } catch (e) {
        const message =
          isAxiosError(e) && e.response?.data?.error?.message
            ? String(e.response.data.error.message)
            : "Failed to save.";
        setServerError(message);
      } finally {
        setIsSaving(false);
      }
    },
    [userName, screenName, avatarColor, user?.avatarUrl, refetch]
  );

  /** アバター画像 URL をプロフィールに保存（アップロード後に呼ぶ） */
  const saveAvatarUrl = useCallback(
    async (avatarUrl: string) => {
      setServerError(undefined);
      try {
        const updated = await patchMe({
          userName: userName.trim(),
          screenName: screenName.trim(),
          avatarColor,
          avatarUrl,
        });
        if (updated) refetch(updated);
        else await refetch();
      } catch (e) {
        const message = isAxiosError(e) && e.response?.data?.error?.message
          ? String(e.response.data.error.message)
          : "Failed to save avatar.";
        setServerError(message);
      }
    },
    [userName, screenName, avatarColor, refetch],
  );

  /** アバター画像を削除（DB の avatar_url を null にする） */
  const clearAvatarUrl = useCallback(async () => {
    setServerError(undefined);
    try {
      const updated = await patchMe({
        userName: userName.trim(),
        screenName: screenName.trim(),
        avatarColor,
        avatarUrl: null,
      });
      if (updated) refetch(updated);
      else await refetch();
    } catch (e) {
      const message =
        isAxiosError(e) && e.response?.data?.error?.message
          ? String(e.response.data.error.message)
          : "Failed to remove avatar.";
      setServerError(message);
    }
  }, [userName, screenName, avatarColor, refetch]);

  return {
    userName,
    screenName,
    avatarColor,
    avatarUrl: user?.avatarUrl ?? null,
    saveAvatarUrl,
    clearAvatarUrl,
    onUserNameChange: setUserName,
    onScreenNameChange: setScreenName,
    onAvatarColorChange: setAvatarColor,
    onSave,
    isSaving,
    userNameError,
    screenNameError,
    errorMessage: serverError,
    isLoading: userLoading,
  };
}
