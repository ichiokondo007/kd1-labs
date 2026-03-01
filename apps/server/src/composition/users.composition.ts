/**
 * /api/users 用コンポジション（ユーザー一覧取得）
 */
import { makeListUsersUsecase } from "../usecases/list-users.usecase";
import { usersDrizzleAdapter } from "../adapters/users.drizzle";

export const listUsersUsecase = makeListUsersUsecase(usersDrizzleAdapter);
