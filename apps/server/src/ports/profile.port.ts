/**
 * プロフィール更新用ポート（DB アクセス抽象）
 * auth と分離し、/api/me の更新のみを担当する。
 */

export interface ProfileUpdateInput {
  userName: string;
  avatarColor: string;
}

export interface ProfilePort {
  /** 指定 user_name のユーザーを 1 件取得（重複チェック用） */
  findUserByUserName(userName: string): Promise<{ userId: string } | null>;
  /** 指定 userId のユーザーを更新（userName, avatarColor のみ） */
  updateProfile(userId: string, input: ProfileUpdateInput): Promise<void>;
  /** パスワード変更（初回変更後は isInitialPassword を false にする） */
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}
