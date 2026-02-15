import type { Meta, StoryObj } from "@storybook/react";
import { LoginPage } from "./LoginPage";

/**
 * Feature Page Story (UI Catalog)
 * - ここでは I/O を行わない
 * - UI は props / mock で表示確認する
 */

const meta: Meta<typeof LoginPage> = {
  title: "pages/LoginPage",
  component: LoginPage,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {};