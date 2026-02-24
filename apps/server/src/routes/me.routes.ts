import { Router } from "express";
import { getMe, patchMe, postPasswordMe } from "../controllers/me.controller";

export const meRoutes = Router();
meRoutes.get("/me", getMe);
meRoutes.patch("/me", patchMe);
meRoutes.post("/me/password", postPasswordMe);
