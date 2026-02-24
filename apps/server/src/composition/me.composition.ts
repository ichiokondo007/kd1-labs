/**
 * /api/me 用コンポジション（プロフィール取得・更新・パスワード変更）
 */
import { makeUpdateProfileUsecase } from "../usecases/update-profile.usecase";
import { makeChangePasswordUsecase } from "../usecases/change-password.usecase";
import { profileDrizzleAdapter } from "../adapters/profile.drizzle";
import { bcryptPasswordHasher } from "../adapters/password-hasher.bcrypt";

export const updateProfileUsecase = makeUpdateProfileUsecase(profileDrizzleAdapter);

export const changePasswordUsecase = makeChangePasswordUsecase(
  profileDrizzleAdapter,
  bcryptPasswordHasher
);
