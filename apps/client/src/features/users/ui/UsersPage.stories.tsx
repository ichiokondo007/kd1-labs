import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { UsersPage } from "./UsersPage";
import UserManagementPageEntry from "../../../pages/user-management";
import type { UsersItem } from "../types";

/**
 * Feature Page Story (UI Catalog)
 * - I/O を行わない。mock で表示確認する
 */

const mockUsers: UsersItem[] = [
  {
    id: "1",
    userName: "Alice Johnson",
    screenName: "alice",
    role: "Admin",
    avatarColor: "#3b82f6",
  },
  {
    id: "2",
    userName: "Bob Smith",
    screenName: "bob_smith",
    role: "Editor",
    avatarColor: "#22c55e",
  },
  {
    id: "3",
    avatarUrl: null,
    userName: "Carol Williams",
    screenName: "carol",
    role: "Viewer",
    avatarColor: "zinc-900",
  },
];

const meta = {
  title: "pages/UsersPage",
  component: UsersPage,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onCreateUser: { action: "onCreateUser" },
    onPasswordReset: { action: "onPasswordReset" },
    onDelete: { action: "onDelete" },
  },
} satisfies Meta<typeof UsersPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: mockUsers,
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
    errorMessage: "Failed to load users.",
  },
};

/**
 * ページコンテナ（useUsers + API）で表示。
 * Storybook では MSW が GET /api/users/items をモックするため一覧が表示される。
 * 「User management」クリック時と同じ挙動を確認できる。
 */
export const PageWithApi: Story = {
  args: { items: [], isLoading: false },
  render: () => <UserManagementPageEntry />,
};
