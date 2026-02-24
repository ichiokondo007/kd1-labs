import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useState } from "react";
import { SettingsPage } from "./SettingsPage";
import type { SettingsPageFormProps } from "../types";
import { AVATAR_COLOR_PALETTE } from "../types";
import { getRequiredUserNameError } from "../domain";

/**
 * Feature Page Story (UI Catalog)
 * - I/O を行わず、props / ローカル state で表示確認
 */

const meta = {
  title: "pages/SettingsPage",
  component: SettingsPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SettingsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/** フォーム state で動かすラッパー（Story 用） */
function SettingsPageWithState(props: Partial<SettingsPageFormProps>) {
  const [userName, setUserName] = useState(props.userName ?? "Alice");
  const [avatarColor, setAvatarColor] = useState(props.avatarColor ?? AVATAR_COLOR_PALETTE[0]);
  const [isSaving, setIsSaving] = useState(props.isSaving ?? false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(props.errorMessage);

  const requiredError = getRequiredUserNameError(userName);
  const displayError = requiredError ?? errorMessage;

  const handleSave = useCallback(() => {
    if (getRequiredUserNameError(userName)) return;
    setIsSaving(true);
    setErrorMessage(undefined);
    setTimeout(() => setIsSaving(false), 800);
  }, [userName]);

  return (
    <SettingsPage
      userName={userName}
      avatarColor={avatarColor}
      onUserNameChange={setUserName}
      onAvatarColorChange={setAvatarColor}
      onSave={handleSave}
      isSaving={isSaving}
      errorMessage={displayError}
    />
  );
}

export const Default: Story = {
  render: () => <SettingsPageWithState />,
};

export const Saving: Story = {
  render: () => (
    <SettingsPageWithState userName="Bob" isSaving />
  ),
};

export const WithError: Story = {
  render: () => (
    <SettingsPageWithState
      userName="Bob"
      errorMessage="Failed to save. Please try again."
    />
  ),
};

/** エラー: ユーザー名が既に使用されている */
export const ErrorUsernameAlreadyInUse: Story = {
  render: () => (
    <SettingsPageWithState
      userName="Bob"
      errorMessage="This username is already in use."
    />
  ),
};

/** エラー: ユーザー名が20文字超過 */
export const ErrorUsernameTooLong: Story = {
  render: () => (
    <SettingsPageWithState
      userName="VeryLongUsernameHere"
      errorMessage="Username must be no more than 20 characters long."
    />
  ),
};

/** エラー: ユーザー名必須（1文字未満） */
export const ErrorUserNameRequired: Story = {
  render: () => <SettingsPageWithState userName="" />,
};
