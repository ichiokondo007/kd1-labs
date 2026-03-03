import { Router } from "express";
import { getUsersItems, postUser } from "../controllers/users.controller";

export const usersRoutes = Router();
usersRoutes.get("/users/items", getUsersItems);
usersRoutes.post("/users", postUser);
