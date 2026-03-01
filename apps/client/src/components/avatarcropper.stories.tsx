import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { AvatarCropper } from "./avatarcropper";
import { Button } from "./button";

/** サンプル用の小さな画像（dataURL） */
const sampleImage =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%236366f1"/><stop offset="100%" style="stop-color:%238b5cf6"/></linearGradient></defs><rect width="400" height="400" fill="url(%23g)"/><circle cx="200" cy="180" r="60" fill="%23fbbf24" opacity="0.9"/><ellipse cx="200" cy="320" rx="100" ry="60" fill="%23f59e0b"/></svg>',
  );

const meta = {
  title: "Components/AvatarCropper",
  component: AvatarCropper,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onCropComplete: { action: "onCropComplete" },
    onCancel: { action: "onCancel" },
  },
} satisfies Meta<typeof AvatarCropper>;

export default meta;

type Story = StoryObj<typeof meta>;

/** デフォルト — ボタンで開き、クロップ or キャンセルで閉じる */
export const Default: Story = {
  render: function DefaultRender(args) {
    const [open, setOpen] = useState(false);
    const [cropped, setCropped] = useState<string | null>(null);
    return (
      <div className="p-8">
        <div className="flex flex-col items-center gap-6">
          <Button onClick={() => setOpen(true)}>アバターを編集</Button>
          {cropped && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-zinc-500">クロップ結果</span>
              <img
                src={cropped}
                alt="Cropped avatar"
                className="h-24 w-24 rounded-full border-2 border-zinc-200 object-cover dark:border-zinc-700"
              />
            </div>
          )}
        </div>
        {open && (
          <AvatarCropper
            {...args}
            imageSrc={sampleImage}
            onCropComplete={(dataUrl) => {
              setCropped(dataUrl);
              setOpen(false);
              args.onCropComplete?.(dataUrl);
            }}
            onCancel={() => {
              setOpen(false);
              args.onCancel?.();
            }}
          />
        )}
      </div>
    );
  },
  args: {
    imageSrc: sampleImage,
    onCropComplete: () => {},
    onCancel: () => {},
    title: "Crop your avatar",
    confirmLabel: "Set new avatar",
    cancelLabel: "Cancel",
  },
};

/** 開いた状態で表示（Canvas 用） */
export const Open: Story = {
  args: {
    imageSrc: sampleImage,
    title: "アバターを切り抜く",
    confirmLabel: "設定する",
    cancelLabel: "キャンセル",
    onCropComplete: () => {},
    onCancel: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "クロッパーを開いた状態で表示。ドラッグ・ズームで調整し、確定またはキャンセルで閉じる想定。",
      },
    },
  },
};
