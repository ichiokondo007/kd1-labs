import type { FC, FormEvent } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/button";
import { ErrorAlert } from "@/components/error-alert";
import { Field, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
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
      userName: (fd.get("userName") as string) ?? "",
      password: (fd.get("password") as string) ?? "",
    });
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-sm grid-cols-1 gap-8"
      >
        {/* ロゴ */}
        <div className="flex justify-center">
          <img
            src="/_kd.png"
            alt="KD1"
            className="h-24 w-auto object-contain"
          />
        </div>

        <Heading><div className="text-center">Sign in to your account</div></Heading>

        {errorMessage && <ErrorAlert>{errorMessage}</ErrorAlert>}

        <Field>
          <Label>UserName</Label>
          <Input
            type="text"
            name="userName"
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
