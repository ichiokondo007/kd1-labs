import { makeCreateUserUsecase } from "../usecases/create-user.usecase";
import { createUserDrizzleAdapter } from "../adapters/create-user.drizzle";

export const createUserUsecase = makeCreateUserUsecase(createUserDrizzleAdapter);
