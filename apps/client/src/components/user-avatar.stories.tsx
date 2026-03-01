import type { Meta, StoryObj } from "@storybook/react";
import { UserAvatar } from "./user-avatar";
import type { UserAvatarUser } from "./user-avatar";

const meta = {
  title: "Components/UserAvatar",
  component: UserAvatar,
  tags: ["autodocs"],
  argTypes: {
    user: { description: "User テーブル由来の表示用データ" },
    className: { description: "サイズなど（例: size-9 shrink-0）" },
  },
} satisfies Meta<typeof UserAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** avatarUrl あり: 画像表示 */
export const WithImage: Story = {
  args: {
    user: {
      userName: "Alice Johnson",
      screenName: "alice",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Alice",
      avatarColor: "#3b82f6",
    },
    className: "size-9 shrink-0",
  },
};

/** avatarUrl なし・avatarColor が hex: 色付き円＋イニシャル */
export const WithHexColor: Story = {
  args: {
    user: {
      userName: "Bob Smith",
      screenName: "bob_smith",
      avatarColor: "#22c55e",
    },
    className: "size-9 shrink-0",
  },
};

/** avatarUrl なし・avatarColor が Tailwind 名 */
export const WithTailwindColor: Story = {
  args: {
    user: {
      userName: "Carol Williams",
      screenName: "carol",
      avatarColor: "zinc-900",
    },
    className: "size-9 shrink-0",
  },
};

/** 複数サイズの並び */
export const Sizes: Story = {
  render: () => {
    const user: UserAvatarUser = {
      userName: "Test User",
      screenName: "test",
      avatarColor: "#8b5cf6",
    };
    return (
      <div className="flex items-end gap-4">
        <UserAvatar user={user} className="size-6 shrink-0" />
        <UserAvatar user={user} className="size-9 shrink-0" />
        <UserAvatar user={user} className="size-12 shrink-0" />
      </div>
    );
  },
};
