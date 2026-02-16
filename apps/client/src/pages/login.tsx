import { LoginPage } from "@/features/login/ui";
import { useLogin } from "@/features/login/hooks";

/**
 * pages は薄いオーケストレーション層
 * - hooks で状態・副作用を取得し、Presentational に渡すだけ
 */
export default function LoginPageEntry() {
  const { isSubmitting, errorMessage, handleSubmit } = useLogin();

  return (
    <LoginPage
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
    />
  );
}
