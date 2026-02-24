import type { Meta, StoryObj } from "@storybook/react";
import { LoginPage } from "./LoginPage";

/**
 * LoginPage Story (UI Catalog)
 *
 * Catalyst UI ベースのログイン画面。
 * - AuthLayout でセンタリング表示
 * - I/O は行わず、props / mock で各状態を確認する
 */
const meta = {
  title: "pages/LoginPage",
  component: LoginPage,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onSubmit: { action: "onSubmit" },
  },
} satisfies Meta<typeof LoginPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/** デフォルト状態 — 初期表示 */
export const Default: Story = {};

/** 送信中 — ボタンが無効化され "Signing in..." 表示 */
export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};

/** エラー表示 — 認証失敗等のメッセージを表示 */
export const WithError: Story = {
  args: {
    errorMessage: "Incorrect username or password.",
  },
};

/** エラー + 送信中の複合状態 */
export const ErrorWhileSubmitting: Story = {
  args: {
    errorMessage: "セッションの有効期限が切れました。再度ログインしてください。",
    isSubmitting: true,
  },
};
