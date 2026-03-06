import { makeUpsertCanvasUsecase } from "../usecases/upsert-canvas.usecase";
import { makeListCanvasesUsecase } from "../usecases/list-canvases.usecase";
import { makeGetCanvasUsecase } from "../usecases/get-canvas.usecase";
import { canvasDocumentDbAdapter } from "../adapters/canvas.documentdb";
import { userMysqlAdapter } from "../adapters/user.mysql";

export const upsertCanvasUsecase = makeUpsertCanvasUsecase(canvasDocumentDbAdapter);
export const listCanvasesUsecase = makeListCanvasesUsecase(canvasDocumentDbAdapter, userMysqlAdapter);
export const getCanvasUsecase = makeGetCanvasUsecase(canvasDocumentDbAdapter);
