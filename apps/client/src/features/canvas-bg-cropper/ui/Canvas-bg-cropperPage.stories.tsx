import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CanvasBgCropper } from "./CanvasBgCropper";
import { Button } from "@/components/button";
import type { BgCropperResult } from "../types";

const sampleImage =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">' +
      '<defs><linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" style="stop-color:%2393c5fd"/>' +
      '<stop offset="100%" style="stop-color:%23dbeafe"/>' +
      "</linearGradient></defs>" +
      '<rect width="800" height="600" fill="url(%23sky)"/>' +
      '<rect y="400" width="800" height="200" fill="%2386efac"/>' +
      '<circle cx="650" cy="120" r="60" fill="%23fbbf24" opacity="0.9"/>' +
      '<rect x="200" y="300" width="120" height="100" rx="4" fill="%23a78bfa"/>' +
      '<polygon points="200,300 260,240 320,300" fill="%23c4b5fd"/>' +
      "</svg>",
  );

const meta = {
  title: "features/CanvasBgCropper",
  component: CanvasBgCropper,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    onApply: { action: "onApply" },
    onCancel: { action: "onCancel" },
  },
} satisfies Meta<typeof CanvasBgCropper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultRender(args) {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<BgCropperResult | null>(null);
    return (
      <div className="p-8">
        <div className="flex flex-col items-center gap-6">
          <Button onClick={() => setOpen(true)}>背景画像を設定</Button>
          {result && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-zinc-500">取込結果</span>
              <pre className="max-w-md overflow-auto rounded-md bg-zinc-100 p-3 text-xs dark:bg-zinc-800">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
        {open && (
          <CanvasBgCropper
            {...args}
            imageSrc={sampleImage}
            targetWidth={1088}
            targetHeight={612}
            onApply={(r) => {
              setResult(r);
              setOpen(false);
              args.onApply?.(r);
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
    targetWidth: 1088,
    targetHeight: 612,
    onApply: () => {},
    onCancel: () => {},
  },
};

export const Open: Story = {
  args: {
    imageSrc: sampleImage,
    targetWidth: 1088,
    targetHeight: 612,
    onApply: () => {},
    onCancel: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "クロッパーを開いた状態で表示。ドラッグで位置調整、スライダーで拡大率変更。取込ボタンで背景画像設定パラメータを返す。",
      },
    },
  },
};
