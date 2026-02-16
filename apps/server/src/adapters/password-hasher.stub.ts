/**
 * パスワードハッシュ化スタブアダプタ
 * スタブ用: "plain:<password>" 形式のみ照合・生成
 */
import type { PasswordHasherPort } from "../ports/password-hasher.port";

export const stubPasswordHasher: PasswordHasherPort = {
  async verify(plain: string, hash: string): Promise<boolean> {
    if (!hash.startsWith("plain:")) return false;
    return hash === `plain:${plain}`;
  },
  async hash(plain: string): Promise<string> {
    return `plain:${plain}`;
  },
};
