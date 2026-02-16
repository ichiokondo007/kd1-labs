import { Router } from "express";
import { getMe, postLogin } from "../controllers/auth.controller";

export const authRoutes = Router();
authRoutes.get("/me", getMe);
authRoutes.post("/login", postLogin);
