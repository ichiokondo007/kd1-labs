/**
 * パスワードハッシュ化 bcrypt アダプタ
 * DB に bcrypt ハッシュを保存する場合に使用する
 */
import bcrypt from "bcrypt";
import type { PasswordHasherPort } from "../ports/password-hasher.port";

const SALT_ROUNDS = 10;

export const bcryptPasswordHasher: PasswordHasherPort = {
  async verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  },
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  },
};
