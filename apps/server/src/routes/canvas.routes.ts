import { Router } from "express";
import { postCanvas, getCanvasItems, getCanvas } from "../controllers/canvas.controller";

export const canvasRoutes = Router();
canvasRoutes.get("/canvas/items", getCanvasItems);
canvasRoutes.get("/canvas/:id", getCanvas);
canvasRoutes.post("/canvas", postCanvas);
