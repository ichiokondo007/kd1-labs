/**
 * プロフィール更新ユースケース
 * userName 必須・長さ・重複チェックのうえ、port 経由で更新する
 */
import type { ProfilePort } from "../ports/profile.port";

const USER_NAME_MAX_LENGTH = 20;

export interface UpdateProfileInput {
  userId: string;
  userName: string;
  avatarColor: string;
}

export type UpdateProfileResult =
  | { ok: true }
  | { ok: false; code: "VALIDATION_ERROR"; message: string }
  | { ok: false; code: "USER_NAME_TAKEN"; message: string };

export function makeUpdateProfileUsecase(profilePort: ProfilePort) {
  return async function updateProfileUsecase(
    input: UpdateProfileInput
  ): Promise<UpdateProfileResult> {
    const trimmed = input.userName.trim();
    if (trimmed.length === 0) {
      return { ok: false, code: "VALIDATION_ERROR", message: "User name is required." };
    }
    if (trimmed.length > USER_NAME_MAX_LENGTH) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: `User name must be at most ${USER_NAME_MAX_LENGTH} characters.`,
      };
    }

    const existing = await profilePort.findUserByUserName(trimmed);
    if (existing && existing.userId !== input.userId) {
      return { ok: false, code: "USER_NAME_TAKEN", message: "That user name is already taken." };
    }

    await profilePort.updateProfile(input.userId, {
      userName: trimmed,
      avatarColor: input.avatarColor,
    });
    return { ok: true };
  };
}
