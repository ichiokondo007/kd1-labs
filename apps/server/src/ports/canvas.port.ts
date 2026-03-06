export interface UpsertCanvasInput {
  id?: string;
  canvasName: string;
  canvas: unknown;
  updatedBy: string;
}

export interface UpsertCanvasOutput {
  id: string;
  canvasName: string;
}

export interface CanvasSummaryRow {
  id: string;
  canvasName: string;
  canvasDescription: string | null;
  thumbnailUrl: string | null;
  updatedBy: string;
  updatedAt: Date;
}

export interface CanvasDetailRow {
  id: string;
  canvasName: string;
  canvas: unknown;
}

export interface CanvasPort {
  upsertCanvas(data: UpsertCanvasInput): Promise<UpsertCanvasOutput>;
  listCanvases(): Promise<CanvasSummaryRow[]>;
  findById(id: string): Promise<CanvasDetailRow | null>;
}

export interface UserLookupPort {
  findUserById(userId: string): Promise<{
    screenName: string;
    avatarUrl: string | null;
    avatarColor: string;
  } | null>;
}
