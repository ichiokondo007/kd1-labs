import type { Meta, StoryObj } from "@storybook/react";
import { SvglibraryPage } from "./SvglibraryPage";

/**
 * Feature Page Story (UI Catalog)
 * - ここでは I/O を行わない
 * - UI は props / mock で表示確認する
 */

const meta = {
  title: "pages/SvglibraryPage",
  component: SvglibraryPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SvglibraryPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};