import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { ErrorMessage } from "@/components/fieldset";
import { FabricCanvas, type FabricCanvasHandle } from "@/features/canvas/ui/FabricCanvas";
import {
  CanvasEditorToolbar,
  type CanvasTool,
} from "@/features/canvas/ui/CanvasEditorToolbar";
import { validateCanvasName } from "@/features/canvas/domain";
import { saveCanvas, fetchCanvas } from "@/features/canvas/services";

export default function CanvasEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const fabricRef = useRef<FabricCanvasHandle>(null);
  const [activeTool, setActiveTool] = useState<CanvasTool>("selection");
  const [canvasName, setCanvasName] = useState("");
  const [canvasNameError, setCanvasNameError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [serverError, setServerError] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();

    (async () => {
      setIsLoading(true);
      setServerError(undefined);
      try {
        const data = await fetchCanvas(id, ac.signal);
        if (ac.signal.aborted) return;
        setCanvasName(data.canvasName);
        await fabricRef.current?.loadFromJSON(data.canvas);
      } catch (e) {
        if (ac.signal.aborted || axios.isCancel(e)) return;
        const msg = e instanceof Error ? e.message : "Failed to load canvas.";
        setServerError(msg);
      } finally {
        if (!ac.signal.aborted) setIsLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id]);

  const handleToolChange = useCallback((tool: CanvasTool) => {
    setActiveTool(tool);
    if (tool === "rect") {
      fabricRef.current?.addRect();
      setActiveTool("selection");
    } else if (tool === "circle") {
      fabricRef.current?.addCircle();
      setActiveTool("selection");
    }
  }, []);

  const handleCancel = useCallback(() => {
    navigate("/example/canvas");
  }, [navigate]);

  const handleDelete = useCallback(() => {
    // TODO: サーバから Canvas を削除 → 一覧へ戻る
  }, []);

  const handleSave = useCallback(async () => {
    const nameError = validateCanvasName(canvasName);
    setCanvasNameError(nameError);
    if (nameError) return;

    const canvasJson = fabricRef.current?.toJSON();
    if (!canvasJson) return;

    setIsSaving(true);
    setServerError(undefined);
    try {
      const result = await saveCanvas(canvasName, canvasJson, id);
      if (result.ok) {
        navigate("/example/canvas");
      } else {
        setServerError(result.message);
      }
    } catch {
      setServerError("Failed to save canvas.");
    } finally {
      setIsSaving(false);
    }
  }, [canvasName, id, navigate]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Heading>Example &gt; Canvas Editor</Heading>
      <Text className="mt-2">
        Fabric.js のキャンバス編集画面です。ツールバーから図形を追加できます。
      </Text>

      <div className="mt-4 flex items-center gap-3">
        <div className="max-w-sm">
          <Input
            type="text"
            placeholder="Canvas Name"
            value={canvasName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setCanvasName(e.target.value);
              setCanvasNameError(undefined);
            }}
            data-invalid={canvasNameError ? true : undefined}
            aria-invalid={!!canvasNameError}
          />
          {canvasNameError && <ErrorMessage>{canvasNameError}</ErrorMessage>}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" outline onClick={handleCancel}>
            Cancel
          </Button>
          {isEditMode && (
            <Button type="button" color="red" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button
            type="button"
            color="dark/zinc"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {serverError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {serverError}
        </p>
      )}

      <div className="mt-3 overflow-x-auto">
        <div className="min-w-[1088px]">
          <CanvasEditorToolbar
            activeTool={activeTool}
            onToolChange={handleToolChange}
          />
          <div className="mt-3 relative">
            <FabricCanvas
              ref={fabricRef}
              skipInitialRect={isEditMode}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md">
                <Text>Loading canvas...</Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
