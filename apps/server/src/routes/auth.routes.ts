import { Router } from "express";
import { postLogin, postLogout } from "../controllers/auth.controller";

export const authRoutes = Router();
authRoutes.post("/login", postLogin);
authRoutes.post("/logout", postLogout);
