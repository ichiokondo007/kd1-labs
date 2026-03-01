import type { Meta, StoryObj } from "@storybook/react";
import { ErrorAlert, ErrorAlertWithDescription } from "./error-alert";

const meta = {
  title: "Components/ErrorAlert",
  component: ErrorAlert,
  tags: ["autodocs"],
  args: {
    children: "ユーザー名またはパスワードが違います",
  },
} satisfies Meta<typeof ErrorAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 単一メッセージ（ログインエラーなど） */
export const Default: Story = {};

/** カスタムメッセージ */
export const CustomMessage: Story = {
  args: {
    children: "セッションの有効期限が切れました。再度ログインしてください。",
  },
};

/** タイトル＋リスト付き（Tailwind Plus Alerts 風） */
export const WithDescription: StoryObj<Meta<typeof ErrorAlertWithDescription>> = {
  render: () => (
    <ErrorAlertWithDescription
      title="There were 2 errors with your submission"
      items={[
        "Your password must be at least 8 characters",
        "Your password must include at least one pro wrestling finishing move",
      ]}
    />
  ),
};
