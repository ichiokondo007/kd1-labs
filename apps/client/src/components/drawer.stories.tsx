import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Drawer, DrawerHeader, DrawerBody } from "./drawer";
import { Button } from "./button";

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg", "xl", "2xl", "3xl"] },
    position: { control: "select", options: ["left", "right"] },
  },
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 右からスライドイン（デフォルト） */
export const Default: Story = {
  render: function DefaultStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer open={open} onClose={() => setOpen(false)}>
          <DrawerHeader title="Panel title" onClose={() => setOpen(false)} />
          <DrawerBody>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Drawer の内容エリアです。他画面でも共通で利用できます。
            </p>
          </DrawerBody>
        </Drawer>
      </>
    );
  },
};

/** 左からスライドイン */
export const PositionLeft: Story = {
  render: function PositionLeftStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open left drawer</Button>
        <Drawer open={open} onClose={() => setOpen(false)} position="left" size="md">
          <DrawerHeader title="Left panel" onClose={() => setOpen(false)} />
          <DrawerBody>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              左から開く Drawer です。
            </p>
          </DrawerBody>
        </Drawer>
      </>
    );
  },
};

/** 幅 sm */
export const SizeSm: Story = {
  render: function SizeSmStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open narrow drawer</Button>
        <Drawer open={open} onClose={() => setOpen(false)} size="sm">
          <DrawerHeader title="Narrow" onClose={() => setOpen(false)} />
          <DrawerBody>max-w-sm のパネルです。</DrawerBody>
        </Drawer>
      </>
    );
  },
};
