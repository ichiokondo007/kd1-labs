/**
 * プロフィール更新ユースケース
 * userName 必須・長さ・重複チェックのうえ、port 経由で更新する
 */
import type { ProfilePort } from "../ports/profile.port";

const USER_NAME_MAX_LENGTH = 20;

export interface UpdateProfileInput {
  userId: string;
  userName: string;
  screenName: string;
  avatarColor: string;
  avatarUrl?: string | null;
}

export type UpdateProfileResult =
  | { ok: true }
  | { ok: false; code: "VALIDATION_ERROR"; message: string }
  | { ok: false; code: "USER_NAME_TAKEN"; message: string };

export function makeUpdateProfileUsecase(profilePort: ProfilePort) {
  return async function updateProfileUsecase(
    input: UpdateProfileInput
  ): Promise<UpdateProfileResult> {
    const trimmedName = input.userName.trim();
    if (trimmedName.length === 0) {
      return { ok: false, code: "VALIDATION_ERROR", message: "User name is required." };
    }
    if (trimmedName.length > USER_NAME_MAX_LENGTH) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: `User name must be at most ${USER_NAME_MAX_LENGTH} characters.`,
      };
    }

    const trimmedScreenName = input.screenName.trim();
    if (trimmedScreenName.length === 0) {
      return { ok: false, code: "VALIDATION_ERROR", message: "NickName (Screen Name) is required." };
    }

    const existing = await profilePort.findUserByUserName(trimmedName);
    if (existing && existing.userId !== input.userId) {
      return { ok: false, code: "USER_NAME_TAKEN", message: "That user name is already taken." };
    }

    await profilePort.updateProfile(input.userId, {
      userName: trimmedName,
      screenName: trimmedScreenName,
      avatarColor: input.avatarColor,
      avatarUrl: input.avatarUrl,
    });
    return { ok: true };
  };
}
