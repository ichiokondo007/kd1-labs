import type { FC } from "react";
import {
  Fieldset,
  FieldGroup,
  Field,
  Label,
  ErrorMessage,
} from "@/components/fieldset";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Avatar } from "@/components/avatar";
import type { SettingsPageFormProps } from "../types";
import { AVATAR_COLOR_PALETTE } from "../types";

/**
 * Presentational: ユーザー情報変更フォーム（パスワード変更なし）
 * - I/O 禁止。表示・入力はすべて props で受け取る
 */
export const SettingsPage: FC<SettingsPageFormProps> = ({
  userName,
  screenName,
  avatarColor,
  onUserNameChange,
  onScreenNameChange,
  onAvatarColorChange,
  onSave,
  isSaving = false,
  userNameError,
  screenNameError,
  errorMessage,
}) => {
  const initials = screenName.trim().slice(0, 2).toUpperCase() || "?";

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-zinc-950 dark:text-white mb-6">
        Profile Settings
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <Fieldset>
          <FieldGroup>
            <Field>
              <Label>UserName</Label>
              <Input
                type="text"
                value={userName}
                onChange={(e) => onUserNameChange(e.target.value)}
                placeholder="User name"
                autoComplete="username"
                data-invalid={userNameError ? true : undefined}
                aria-invalid={!!userNameError}
              />
              {userNameError && <ErrorMessage>{userNameError}</ErrorMessage>}
            </Field>

            <Field>
              <Label>NickName (Screen Name)</Label>
              <Input
                type="text"
                value={screenName}
                onChange={(e) => onScreenNameChange(e.target.value)}
                placeholder="Nickname"
                autoComplete="nickname"
                data-invalid={screenNameError ? true : undefined}
                aria-invalid={!!screenNameError}
              />
              {screenNameError && <ErrorMessage>{screenNameError}</ErrorMessage>}
            </Field>

            <Field>
              <Label>Avatar</Label>
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex size-20 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-600"
                  style={{ backgroundColor: avatarColor }}
                >
                  <Avatar
                    initials={initials}
                    alt="Avatar"
                    className="size-20 text-2xl"
                  />
                </span>
              </div>
            </Field>

            <Field>
              <Label>Avatar color</Label>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Avatar color">
                {AVATAR_COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="size-9 rounded-full border-2 transition-[border-color,transform] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    style={{
                      backgroundColor: color,
                      borderColor: avatarColor === color ? "var(--color-blue-500)" : "transparent",
                      transform: avatarColor === color ? "scale(1.1)" : undefined,
                    }}
                    onClick={() => onAvatarColorChange(color)}
                    title={color}
                    aria-pressed={avatarColor === color ? "true" : "false"}
                  />
                ))}
              </div>
            </Field>
          </FieldGroup>
        </Fieldset>

        {errorMessage && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
            {errorMessage}
          </p>
        )}
        <div className="mt-6">
          <Button type="submit" color="dark/zinc" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};
