import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { LoginFormData } from "../types";
import { postLogin } from "../services";
import { getPostLoginRoute } from "../domain";

/**
 * hooks は:
 * - state 管理
 * - 副作用（I/O）
 * - UI イベントのハンドリング
 * を担当する。UI はこの hook の戻り値だけ見る。
 */

export function useLogin() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  const handleSubmit = useCallback(
    async (data: LoginFormData) => {
      setIsSubmitting(true);
      setErrorMessage(undefined);

      try {
        const user = await postLogin(data);
        const route = getPostLoginRoute(user);
        navigate(route);
      } catch (e) {
        const msg =
          (e as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message ??
          (e instanceof Error ? e.message : "Incorrect username or password.");
        setErrorMessage(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate],
  );

  return { isSubmitting, errorMessage, handleSubmit };
}
