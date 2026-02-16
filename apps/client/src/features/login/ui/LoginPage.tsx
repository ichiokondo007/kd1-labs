import type { FC, FormEvent } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Text } from "@/components/text";
import type { LoginPageProps } from "../types";

/**
 * LoginPage — Presentational
 *
 * - I/O 禁止（fetch/axios 直呼び出し禁止）
 * - 業務判断は domain に寄せる
 * - Catalyst UI コンポーネントで構成
 */
export const LoginPage: FC<LoginPageProps> = ({
  onSubmit,
  isSubmitting = false,
  errorMessage,
}) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onSubmit) return;

    const fd = new FormData(e.currentTarget);
    onSubmit({
      userId: (fd.get("userId") as string) ?? "",
      password: (fd.get("password") as string) ?? "",
    });
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-sm grid-cols-1 gap-8"
      >
        {/* ロゴ placeholder — 後でプロジェクトロゴに差し替え */}
        <Text className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          KD1
        </Text>

        <Heading>Sign in to your account</Heading>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
          >
            {errorMessage}
          </div>
        )}

        <Field>
          <Label>UserID</Label>
          <Input
            type="text"
            name="userId"
            autoComplete="username"
            required
          />
        </Field>

        <Field>
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </Field>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </Button>
      </form>
    </AuthLayout>
  );
};
