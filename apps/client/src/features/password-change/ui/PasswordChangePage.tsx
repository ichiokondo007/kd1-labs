import type { FC } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Divider } from "@/components/divider";
import {
  Fieldset,
  FieldGroup,
  Field,
  Label,
  ErrorMessage,
} from "@/components/fieldset";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import type { PasswordChangePageFormProps } from "../types";

/**
 * Presentational: パスワード変更フォーム
 * - I/O 禁止。表示・入力はすべて props で受け取る
 * - LoginPage と同じ center 表示（AuthLayout）
 */
export const PasswordChangePage: FC<PasswordChangePageFormProps> = ({
  userName,
  newPassword,
  confirmPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSave,
  isSaving = false,
  errorMessage,
}) => {
  return (
    <AuthLayout>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        className="grid w-full max-w-sm grid-cols-1 gap-8"
      >
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-white text-center">
          Password Change
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400 text-center">
          Please change the password for the {userName} account.
        </p>

        <Divider />

        <Fieldset>
          <FieldGroup>
            <Field>
              <Label>New password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                data-invalid={errorMessage ? true : undefined}
                aria-invalid={!!errorMessage}
              />
            </Field>

            <Field>
              <Label>Confirm password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
                data-invalid={errorMessage ? true : undefined}
                aria-invalid={!!errorMessage}
              />
              {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            </Field>
          </FieldGroup>
        </Fieldset>

        <Button type="submit" className="w-full" color="dark/zinc" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </form>
    </AuthLayout>
  );
};
