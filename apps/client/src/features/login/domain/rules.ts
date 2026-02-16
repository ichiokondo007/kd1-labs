import type { UserInfo } from "../types";

/**
 * domain は純関数中心（React 非依存）
 */

/** ログイン成功後の遷移先を判定 */
export function getPostLoginRoute(user: UserInfo): string {
  if (user.isInitialPassword === 1) {
    return "/password-change";
  }
  return "/";
}
