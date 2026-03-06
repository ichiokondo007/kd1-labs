import type { Meta, StoryObj } from "@storybook/react";
import { BloglistPage } from "./BloglistPage";
import type { BloglistItem } from "../types";

const mockPosts: BloglistItem[] = [
  {
    id: "1",
    title: "Boost your conversion rate",
    href: "#",
    description:
      "Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel iusto corrupti dicta laboris incididunt.",
    imageUrl:
      "https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&auto=format&fit=crop&w=3603&q=80",
    date: "Mar 16, 2020",
    datetime: "2020-03-16",
    createdAt: "2020-03-16T00:00:00Z",
    category: { title: "Marketing", href: "#" },
    author: {
      name: "Michael Foster",
      role: "Co-Founder / CTO",
      href: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  },
  {
    id: "2",
    title: "How to use search engine optimization to drive sales",
    href: "#",
    description:
      "Optio sit exercitation et ex ullamco aliquid explicabo. Dolore do ut officia anim non ad eu. Magna laboris incididunt commodo elit ipsum.",
    imageUrl:
      "https://images.unsplash.com/photo-1547586696-ea22b4d4235d?ixlib=rb-4.0.3&auto=format&fit=crop&w=3270&q=80",
    date: "Mar 10, 2020",
    datetime: "2020-03-10",
    createdAt: "2020-03-10T00:00:00Z",
    category: { title: "Sales", href: "#" },
    author: {
      name: "Lindsay Walton",
      role: "Front-end Developer",
      href: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  },
  {
    id: "3",
    title: "Improve your customer experience",
    href: "#",
    description:
      "Dolore commodo in nulla do nulla esse consectetur. Adipisicing voluptate velit sint adipisicing ex duis elit deserunt sint ipsum. Culpa in exercitation magna adipisicing id reprehenderit consectetur culpa eu cillum.",
    imageUrl:
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7?ixlib=rb-4.0.3&auto=format&fit=crop&w=3270&q=80",
    date: "Feb 12, 2020",
    datetime: "2020-02-12",
    createdAt: "2020-02-12T00:00:00Z",
    category: { title: "Business", href: "#" },
    author: {
      name: "Tom Cook",
      role: "Director of Product",
      href: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  },
];

const meta = {
  title: "pages/BloglistPage",
  component: BloglistPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof BloglistPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/** デフォルト — 3件のブログカード表示 */
export const Default: Story = {
  args: {
    items: mockPosts,
    isLoading: false,
  },
};

/** 空状態 — データなし */
export const Empty: Story = {
  args: {
    items: [],
    isLoading: false,
  },
};

/** ローディング中 */
export const Loading: Story = {
  args: {
    items: [],
    isLoading: true,
  },
};

/** エラー表示 */
export const Error: Story = {
  args: {
    items: [],
    isLoading: false,
    errorMessage: "ブログ記事の読み込みに失敗しました。",
  },
};

/** 1件のみ表示 */
export const SinglePost: Story = {
  args: {
    items: [mockPosts[0]],
    isLoading: false,
  },
};