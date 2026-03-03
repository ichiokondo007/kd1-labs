/**
 * 新規ユーザー作成ユースケース
 * 固定パスワードでユーザーを登録する。userName 一意チェックは Port 側で実施。
 */
import type { CreateUserPort, CreateUserResult } from "../ports/create-user.port";

export function makeCreateUserUsecase(port: CreateUserPort) {
  return async function createUserUsecase(
    userName: string,
    screenName: string
  ): Promise<CreateUserResult> {
    const trimmedUserName = userName.trim();
    const trimmedScreenName = screenName.trim();
    if (!trimmedUserName || !trimmedScreenName) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "UserName and Screen Name are required.",
      };
    }
    return port.createUser(trimmedUserName, trimmedScreenName);
  };
}
