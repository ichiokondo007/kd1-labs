import { Router } from "express";
import { postStorageUpload } from "../controllers/storage.controller";

export const storageRoutes = Router();
storageRoutes.post("/storage/upload", postStorageUpload);
