import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { BloglistPage } from "./BloglistPage";
import type { BloglistItem } from "../types";

const mockPosts: BloglistItem[] = [
  {
    slug: "getting-started",
    title: "Getting Started with KD1 Labs",
    description:
      "KD1 Labs プロジェクトの概要と開発環境セットアップガイド。初めての方はこちらから。",
    imageUrl:
      "https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&auto=format&fit=crop&w=3603&q=80",
    date: "Mar 12, 2026",
    datetime: "2026-03-12",
    category: { title: "Guide" },
    author: { name: "ichio", role: "Developer" },
  },
  {
    slug: "yjs-architecture",
    title: "Yjs CRDT による共同編集アーキテクチャ",
    description:
      "Fabric.js Canvas 上でリアルタイム共同編集を実現するための Yjs CRDT 設計と実装方針。",
    imageUrl:
      "https://images.unsplash.com/photo-1547586696-ea22b4d4235d?ixlib=rb-4.0.3&auto=format&fit=crop&w=3270&q=80",
    date: "Mar 10, 2026",
    datetime: "2026-03-10",
    category: { title: "Architecture" },
    author: { name: "ichio", role: "Developer" },
  },
  {
    slug: "docker-setup",
    title: "Docker Compose によるローカル開発環境",
    description:
      "MongoDB, MinIO, API サーバを Docker Compose で立ち上げるマルチサービス構成の解説。",
    imageUrl:
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7?ixlib=rb-4.0.3&auto=format&fit=crop&w=3270&q=80",
    date: "Mar 5, 2026",
    datetime: "2026-03-05",
    category: { title: "DevOps" },
    author: { name: "ichio", role: "Developer" },
  },
];

const meta = {
  title: "pages/BloglistPage",
  component: BloglistPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof BloglistPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: mockPosts,
    isLoading: false,
  },
};

export const Empty: Story = {
  args: {
    items: [],
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    items: [],
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    items: [],
    isLoading: false,
    errorMessage: "ブログ記事の読み込みに失敗しました。",
  },
};
