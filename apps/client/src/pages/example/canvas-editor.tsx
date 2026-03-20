import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Field, ErrorMessage } from "@/components/fieldset";
import { DialogMessage } from "@/components/dialog-message";
import { FabricCanvas, type FabricCanvasHandle } from "@/features/canvas/ui/FabricCanvas";
import {
  CanvasEditorToolbar,
  type CanvasTool,
} from "@/features/canvas/ui/CanvasEditorToolbar";
import { validateCanvasName } from "@/features/canvas/domain";
import { saveCanvas, fetchCanvas, deleteCanvas } from "@/features/canvas/services";
import { uploadFile } from "@/services/storageApi";
import { CanvasBgCropper } from "@/features/canvas-bg-cropper";
import type { BgCropperResult } from "@/features/canvas-bg-cropper";
import { SvgAssetsDrawer } from "@/features/svglibrary/ui/SvgAssetsDrawer";
import type { SvgAssetItem } from "@kd1-labs/types";

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
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [savedCanvasName, setSavedCanvasName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bgCropperSrc, setBgCropperSrc] = useState<string | null>(null);
  const [svgDrawerOpen, setSvgDrawerOpen] = useState(false);
  const [hasCanvasSelection, setHasCanvasSelection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (tool === "image") {
      setSvgDrawerOpen(true);
      setActiveTool("selection");
    } else if (tool === "bgImage") {
      fileInputRef.current?.click();
      setActiveTool("selection");
    }
  }, []);

  const handleShapePlaced = useCallback(() => {
    setActiveTool("selection");
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBgCropperSrc(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [],
  );

  const handleBgApply = useCallback(
    async (result: BgCropperResult) => {
      setBgCropperSrc(null);
      try {
        const { url } = await uploadFile(result.dataUrl, "image/jpeg");
        await fabricRef.current?.setBackgroundImage({ ...result, dataUrl: url });
      } catch {
        setServerError("Failed to upload background image.");
      }
    },
    [],
  );

  const handleSvgSelect = useCallback((item: SvgAssetItem) => {
    setSvgDrawerOpen(false);
    fabricRef.current?.placeSvgFromUrl(item.url);
  }, []);

  const handleBgCropperCancel = useCallback(() => {
    setBgCropperSrc(null);
  }, []);

  const handleCancel = useCallback(() => {
    navigate("/example/canvas");
  }, [navigate]);

  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!id) {
      setShowDeleteDialog(false);
      navigate("/example/canvas");
      return;
    }

    setIsDeleting(true);
    setServerError(undefined);
    try {
      const result = await deleteCanvas(id);
      if (result.ok) {
        setShowDeleteDialog(false);
        navigate("/example/canvas");
      } else {
        setShowDeleteDialog(false);
        setServerError(result.message);
      }
    } catch {
      setShowDeleteDialog(false);
      setServerError("Failed to delete canvas.");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteCanvas, id, navigate]);

  const handleSave = useCallback(async () => {
    const nameError = validateCanvasName(canvasName);
    setCanvasNameError(nameError);
    if (nameError) return;

    const canvasJson = fabricRef.current?.toJSON();
    if (!canvasJson) return;

    setIsSaving(true);
    setServerError(undefined);
    try {
      let thumbnailKey: string | undefined;
      const dataUrl = fabricRef.current?.toDataURL();
      if (dataUrl) {
        try {
          const { key } = await uploadFile(dataUrl, "image/jpeg");
          thumbnailKey = key;
        } catch {
          // サムネイルアップロード失敗は無視して保存を続行
        }
      }

      const result = await saveCanvas(canvasName, canvasJson, id, thumbnailKey);
      if (result.ok) {
        setSavedCanvasName(result.canvasName);
        setShowSuccessDialog(true);
      } else {
        setServerError(result.message);
      }
    } catch {
      setServerError("Failed to save canvas.");
    } finally {
      setIsSaving(false);
    }
  }, [canvasName, id]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Heading>Example &gt; Canvas Editor</Heading>
      <Text className="mt-2">
        Fabric.js のキャンバス編集画面です。ツールバーから図形を追加できます。
      </Text>

      <div className="mt-4 flex items-center gap-3">
        <Field className="max-w-sm">
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
        </Field>
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" outline onClick={handleCancel}>
            Cancel
          </Button>
          {isEditMode && (
            <Button type="button" color="red" onClick={handleDelete} disabled={isDeleting || isSaving || isLoading}>
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
            onDeleteSelected={() => fabricRef.current?.deleteSelectedObjects()}
            deleteDisabled={!hasCanvasSelection}
          />
          <div className="mt-3 relative">
            <FabricCanvas
              ref={fabricRef}
              skipInitialRect={isEditMode}
              activeTool={activeTool}
              onShapePlaced={handleShapePlaced}
              onSelectionChange={setHasCanvasSelection}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md">
                <Text>Loading canvas...</Text>
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="背景画像を選択"
        onChange={handleFileSelect}
      />

      {bgCropperSrc && (
        <CanvasBgCropper
          imageSrc={bgCropperSrc}
          targetWidth={1088}
          targetHeight={612}
          onApply={handleBgApply}
          onCancel={handleBgCropperCancel}
        />
      )}

      <SvgAssetsDrawer
        open={svgDrawerOpen}
        onClose={() => setSvgDrawerOpen(false)}
        onSelect={handleSvgSelect}
      />

      <DialogMessage
        open={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          navigate("/example/canvas");
        }}
        title="Canvas Saved"
        message={`Canvas has been saved.\nCanvas name: ${savedCanvasName}`}
        iconVariant="success"
        primaryButton={{
          label: "OK",
          onClick: () => {},
        }}
      />

      <DialogMessage
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Canvasを削除しますか？"
        message={"Canvasを削除します。この操作は取り消せません。"}
        iconVariant="warning"
        primaryButton={{
          label: "削除する",
          onClick: handleConfirmDelete,
          color: "red",
        }}
        secondaryButton={{
          label: "キャンセル",
          onClick: () => {},
        }}
      />
    </div>
  );
}
