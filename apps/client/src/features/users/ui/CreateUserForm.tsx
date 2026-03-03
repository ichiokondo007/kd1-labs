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
import type { CreateUserFormProps } from "../types";

/**
 * Presentational: 新規ユーザー登録フォーム（Drawer 内用）
 * - I/O 禁止。表示・入力はすべて props で受け取る
 * - ボタンは「キャンセル」「Save」のみ。必須チェックは Settings と同じ文言。
 */
export const CreateUserForm: FC<CreateUserFormProps> = ({
  userName,
  screenName,
  onUserNameChange,
  onScreenNameChange,
  onSave,
  onCancel,
  isSaving = false,
  userNameError,
  screenNameError,
  errorMessage,
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="flex flex-col gap-6"
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
            <Label>Screen Name (Nickname)</Label>
            <Input
              type="text"
              value={screenName}
              onChange={(e) => onScreenNameChange(e.target.value)}
              placeholder="Screen name"
              autoComplete="nickname"
              data-invalid={screenNameError ? true : undefined}
              aria-invalid={!!screenNameError}
            />
            {screenNameError && <ErrorMessage>{screenNameError}</ErrorMessage>}
          </Field>
        </FieldGroup>
      </Fieldset>

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" outline onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" color="dark/zinc" disabled={isSaving}>
          {isSaving ? "保存中…" : "Save"}
        </Button>
      </div>
    </form>
  );
};
