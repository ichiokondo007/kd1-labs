import type { Meta, StoryObj } from "@storybook/react";
import React, { useCallback, useState } from "react";
import { PasswordChangePage } from "./PasswordChangePage";
import type { PasswordChangePageFormProps } from "../types";

/**
 * Feature Page Story (UI Catalog)
 * - I/O を行わず、props / ローカル state で表示確認
 */

const defaultArgs: Partial<PasswordChangePageFormProps> = {
  userName: "Alice",
  newPassword: "",
  confirmPassword: "",
  onNewPasswordChange: () => {},
  onConfirmPasswordChange: () => {},
  onSave: () => {},
};

const meta = {
  title: "pages/PasswordChangePage",
  component: PasswordChangePage,
  parameters: {
    layout: "fullscreen",
  },
  args: defaultArgs,
} satisfies Meta<typeof PasswordChangePage>;

export default meta;

type Story = StoryObj<typeof meta>;

/** フォーム state で動かすラッパー（Story 用） */
function PasswordChangePageWithState(props: Partial<PasswordChangePageFormProps>) {
  const [newPassword, setNewPassword] = useState(props.newPassword ?? "");
  const [confirmPassword, setConfirmPassword] = useState(props.confirmPassword ?? "");
  const [isSaving, setIsSaving] = useState(props.isSaving ?? false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(props.errorMessage);

  const handleSave = useCallback(() => {
    setErrorMessage(undefined);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  }, []);

  return (
    <PasswordChangePage
      userName={props.userName ?? "Alice"}
      newPassword={newPassword}
      confirmPassword={confirmPassword}
      onNewPasswordChange={setNewPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSave={handleSave}
      isSaving={isSaving}
      errorMessage={errorMessage}
    />
  );
}

export const Default: Story = {
  args: defaultArgs,
  render: () => <PasswordChangePageWithState />,
};

export const WithValues: Story = {
  args: {
    ...defaultArgs,
    userName: "Bob",
    newPassword: "newSecret123",
    confirmPassword: "newSecret123",
  },
  render: () => (
    <PasswordChangePageWithState
      userName="Bob"
      newPassword="newSecret123"
      confirmPassword="newSecret123"
    />
  ),
};

export const Saving: Story = {
  args: { ...defaultArgs, userName: "Carol" },
  render: () => (
    <PasswordChangePageWithState userName="Carol" newPassword="***" confirmPassword="***" isSaving />
  ),
};

export const WithError: Story = {
  args: {
    ...defaultArgs,
    userName: "Dave",
    errorMessage: "Passwords do not match.",
  },
  render: () => (
    <PasswordChangePageWithState
      userName="Dave"
      newPassword="a"
      confirmPassword="b"
      errorMessage="Passwords do not match."
    />
  ),
};
