import { randomInt } from 'node:crypto';

/**
 * 初期パスワードを生成する
 * 大文字、小文字、数字を最低1文字ずつ含む8文字のパスワードを生成する
 * @returns 初期パスワード
 */
export function generateInitialPassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const all = upper + lower + digits;

  // 各カテゴリから最低1文字を確保
  const required = [
    upper[randomInt(upper.length)],
    lower[randomInt(lower.length)],
    digits[randomInt(digits.length)],
  ];

  // 残り5文字をランダムに埋める
  const rest = Array.from({ length: 5 }, () => all[randomInt(all.length)]);

  // 結合してシャッフル
  const chars = [...required, ...rest];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

export type PasswordValidationResult = {
  valid: boolean;
  error?: string;
};

/**
 * パスワードの検証
 * 大文字、小文字、数字を最低1文字ずつ含む5文字以上20文字以内のパスワードを生成する
 * @param password
 * @returns パスワードの検証結果
 */
export function validatePassword(password: string): PasswordValidationResult {
  const isValid =
    password.length >= 5 &&
    password.length <= 20 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /^[A-Za-z0-9]+$/.test(password);

  return isValid
    ? { valid: true }
    : { valid: false, error: 'Password must be 5–20 characters, using uppercase, lowercase, and numbers.' };
}
