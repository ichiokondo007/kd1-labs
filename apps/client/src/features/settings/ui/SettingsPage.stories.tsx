import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useState } from "react";
import { SettingsPage } from "./SettingsPage";
import type { SettingsPageFormProps } from "../types";
import { AVATAR_COLOR_PALETTE } from "../types";
import { getRequiredUserNameError, getRequiredScreenNameError } from "../domain";

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
  const [screenName, setScreenName] = useState(props.screenName ?? "Alice");
  const [avatarColor, setAvatarColor] = useState(props.avatarColor ?? AVATAR_COLOR_PALETTE[0]);
  const [isSaving, setIsSaving] = useState(props.isSaving ?? false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(props.errorMessage);

  const userNameError = getRequiredUserNameError(userName);
  const screenNameError = getRequiredScreenNameError(screenName);

  const handleSave = useCallback((_pendingAvatarDataUrl?: string | null) => {
    if (getRequiredUserNameError(userName) || getRequiredScreenNameError(screenName)) return;
    setIsSaving(true);
    setErrorMessage(undefined);
    setTimeout(() => setIsSaving(false), 800);
  }, [userName, screenName]);

  return (
    <SettingsPage
      userName={userName}
      screenName={screenName}
      avatarColor={avatarColor}
      onAvatarChangeClick={props.onAvatarChangeClick ?? (() => {})}
      onUserNameChange={setUserName}
      onScreenNameChange={setScreenName}
      onAvatarColorChange={setAvatarColor}
      onSave={handleSave}
      isSaving={isSaving}
      userNameError={userNameError}
      screenNameError={screenNameError}
      errorMessage={errorMessage}
    />
  );
}

export const Default: Story = {
  render: () => <SettingsPageWithState />,
};

export const Saving: Story = {
  render: () => (
    <SettingsPageWithState userName="Bob" screenName="Bob" isSaving />
  ),
};

export const WithError: Story = {
  render: () => (
    <SettingsPageWithState
      userName="Bob"
      screenName="Bob"
      errorMessage="Failed to save. Please try again."
    />
  ),
};

/** エラー: ユーザー名が既に使用されている */
export const ErrorUsernameAlreadyInUse: Story = {
  render: () => (
    <SettingsPageWithState
      userName="Bob"
      screenName="Bob"
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
  render: () => <SettingsPageWithState userName="" screenName="Bob" />,
};

/** エラー: NickName（Screen Name）必須（1文字未満） */
export const ErrorScreenNameRequired: Story = {
  render: () => <SettingsPageWithState userName="Alice" screenName="" />,
};
