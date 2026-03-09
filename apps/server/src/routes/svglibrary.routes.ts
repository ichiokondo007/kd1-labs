import { Router } from "express";
import {
  getSvglibraryItems,
  postSvglibraryUpload,
  deleteSvglibraryItem,
} from "../controllers/svglibrary.controller";

export const svglibraryRoutes = Router();

svglibraryRoutes.get("/svglibrary/items", getSvglibraryItems);
svglibraryRoutes.post("/svglibrary/upload", postSvglibraryUpload);
svglibraryRoutes.delete("/svglibrary/:key", deleteSvglibraryItem);
