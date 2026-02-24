/**
 * 認証コンポジション
 * 認証ユースケースを作成する
 *
 * @returns 認証ユースケース
 */
import { makeLoginUsecase } from "../usecases/login.usecase";
import { authDrizzleAdapter } from "../adapters/auth.drizzle";
import { bcryptPasswordHasher } from "../adapters/password-hasher.bcrypt";
import { stubPasswordHasher } from "../adapters/password-hasher.stub";


export const loginUsecase = makeLoginUsecase({
  authPort: authDrizzleAdapter,
  passwordHasher: bcryptPasswordHasher,
  //passwordHasher: stubPasswordHasher,
});
