/**
 * 認証付き API 用の共有 axios インスタンス。
 * リクエスト開始/終了で loadingStore を更新し、共通ローディング表示に連動する。
 */
import axios from "axios";
import { addRequest, removeRequest } from "./loadingStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  addRequest();
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    removeRequest();
    return response;
  },
  (error) => {
    removeRequest();
    // セッション切れ（401）時はログイン画面へ遷移
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (!path.startsWith("/login")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);
