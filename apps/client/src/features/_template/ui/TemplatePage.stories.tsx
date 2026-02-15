import type { Meta, StoryObj } from "@storybook/react";
import { TemplatePage } from "./TemplatePage";

/**
 * Feature Page Story (UI Catalog)
 * - ここでは I/O を行わない
 * - UI は props / mock で表示確認する
 */

const meta: Meta<typeof TemplatePage> = {
  title: "pages/TemplatePage",
  component: TemplatePage,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof TemplatePage>;

export const Default: Story = {};