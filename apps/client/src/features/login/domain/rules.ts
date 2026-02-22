import type { UserInfo } from "../types";

/**
 * domain は純関数中心（React 非依存）
 */

/** ログイン成功後の遷移先を判定（dashboard-layout 内の home またはパスワード変更） */
export function getPostLoginRoute(user: UserInfo): string {
  if (user.isInitialPassword) {
    return "/password-change";
  }
  return "/home";
}
