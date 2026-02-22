import type { LoginRequest, LoginResponse, UserInfo } from "@kd1-labs/types";
import type { AuthPort } from "../ports/auth.port";
import type { PasswordHasherPort } from "../ports/password-hasher.port";
import { err, ok, type Result } from "../lib/result";

type LoginError =
  | { code: "INVALID_INPUT"; message: string }
  | { code: "INVALID_CREDENTIALS"; message: string };

export function makeLoginUsecase(deps: {
  authPort: AuthPort;
  passwordHasher: PasswordHasherPort;
}) {
  return async function loginUsecase(
    input: LoginRequest
  ): Promise<Result<LoginResponse, LoginError>> {
    const userName = input.userName?.trim();
    const password = input.password;

    // 1) 入力チェック
    if (!userName || !password) {
      return err({ code: "INVALID_INPUT", message: "ユーザー名と password は必須です" });
    }

    // 2) DB照合（Port経由）
    const user = await deps.authPort.findUserByUserName(userName);
    if (!user) {
      return err({ code: "INVALID_CREDENTIALS", message: "ユーザー名またはパスワードが違います" });
    }

    // 3) パスワード照合（Port経由）
    const okPw = await deps.passwordHasher.verify(password, user.passwordHash);
    if (!okPw) {
      return err({ code: "INVALID_CREDENTIALS", message: "ユーザー名またはパスワードが違います" });
    }

    // 4) レスポンス生成（遷移判断はフロントが行う）
    const userInfo: UserInfo = {
      userId: user.userId,
      userName: user.userName,
      isInitialPassword: user.isInitialPassword,
      isAdmin: user.isAdmin,
    };

    return ok({ userInfo } satisfies LoginResponse);
  };
}
