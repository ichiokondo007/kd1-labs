/**
 * パスワード変更ユースケース
 * 新パスワードの検証・ハッシュ化のうえ、port 経由で更新する
 */
import type { PasswordHasherPort } from "../ports/password-hasher.port";
import type { ProfilePort } from "../ports/profile.port";

const MIN_PASSWORD_LENGTH = 8;

export interface ChangePasswordInput {
  userId: string;
  newPassword: string;
}

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; code: "VALIDATION_ERROR"; message: string };

export function makeChangePasswordUsecase(
  profilePort: ProfilePort,
  passwordHasher: PasswordHasherPort
) {
  return async function changePasswordUsecase(
    input: ChangePasswordInput
  ): Promise<ChangePasswordResult> {
    const pwd = input.newPassword;
    if (pwd.length < MIN_PASSWORD_LENGTH) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      };
    }

    const passwordHash = await passwordHasher.hash(pwd);
    await profilePort.updatePassword(input.userId, passwordHash);
    return { ok: true };
  };
}
