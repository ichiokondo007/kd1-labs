/**
 * パスワードハッシュ検証ポート
 * 平文とハッシュの照合、およびハッシュ生成（登録時用）
 */
export interface PasswordHasherPort {
  /** 平文パスワードとハッシュを照合する */
  verify(plain: string, hash: string): Promise<boolean>;
  /** 平文をハッシュ化する（登録時用） */
  hash(plain: string): Promise<string>;
}
