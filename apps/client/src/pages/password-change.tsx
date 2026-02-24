import { PasswordChangePage } from "@/features/password-change/ui";
import { usePasswordChangeForm } from "@/features/password-change/hooks";
import { AuthLayout } from "@/components/auth-layout";

/**
 * パスワード変更ページ（薄いエントリ。状態は hook に委譲）
 * ログイン直後 isInitialPassword 時に /password-change へ遷移して表示する
 */
export default function PasswordChangePageEntry() {
  const props = usePasswordChangeForm();

  if (props.isLoading) {
    return (
      <AuthLayout>
        <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
      </AuthLayout>
    );
  }

  const { isLoading: _, ...formProps } = props;
  return <PasswordChangePage {...formProps} />;
}
