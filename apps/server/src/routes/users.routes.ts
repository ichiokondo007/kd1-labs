import { Router } from "express";
import { getUsersItems } from "../controllers/users.controller";

export const usersRoutes = Router();
usersRoutes.get("/users/items", getUsersItems);
