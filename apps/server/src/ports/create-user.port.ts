/**
 * 新規ユーザー作成用ポート（DB ・ ハッシュ抽象）
 */
export type CreateUserResult =
  | { ok: true; userId: string; userName: string }
  | { ok: false; code: string; message: string };

export interface CreateUserPort {
  createUser(userName: string, screenName: string): Promise<CreateUserResult>;
}
