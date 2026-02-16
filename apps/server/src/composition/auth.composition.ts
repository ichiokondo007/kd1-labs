/**
 * 認証コンポジション
 * 認証ユースケースを作成する
 *
 * @returns 認証ユースケース
 */
import { makeLoginUsecase } from "../usecases/login.usecase";
import { authStubAdapter } from "../adapters/auth.stub";
import { stubPasswordHasher } from "../adapters/password-hasher.stub";

export const loginUsecase = makeLoginUsecase({
  authPort: authStubAdapter,
  passwordHasher: stubPasswordHasher,
});
