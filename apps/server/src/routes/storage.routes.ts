import { Router } from "express";
import { postStorageUpload, getStorageProxy } from "../controllers/storage.controller";

export const storageRoutes = Router();
storageRoutes.post("/storage/upload", postStorageUpload);
storageRoutes.get("/storage/proxy", getStorageProxy);
