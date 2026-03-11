import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Button } from "@/components/button";
import { FabricCanvas, type FabricCanvasHandle } from "@/features/canvas/ui/FabricCanvas";
import {
  CanvasEditorToolbar,
  type CanvasTool,
} from "@/features/canvas/ui/CanvasEditorToolbar";
import { fetchCanvas } from "@/features/canvas/services";
import { uploadFile } from "@/services/storageApi";
import { CanvasBgCropper } from "@/features/canvas-bg-cropper";
import type { BgCropperResult } from "@/features/canvas-bg-cropper";
import { SvgAssetsDrawer } from "@/features/svglibrary/ui/SvgAssetsDrawer";
import type { SvgAssetItem } from "@kd1-labs/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useYjsConnection } from "@/features/canvas-yjs/hooks/useYjsConnection";
import { useYjsCircleSync } from "@/features/canvas-yjs/hooks/useYjsCircleSync";
import { ConnectedUsers } from "@/features/canvas-yjs/ui/ConnectedUsers";
import { ConnectionStatusBadge } from "@/features/canvas-yjs/ui/ConnectionStatusBadge";

export default function CanvasYjsEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fabricRef = useRef<FabricCanvasHandle>(null);
  const [activeTool, setActiveTool] = useState<CanvasTool>("selection");
  const [canvasName, setCanvasName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | undefined>();
  const [bgCropperSrc, setBgCropperSrc] = useState<string | null>(null);
  const [svgDrawerOpen, setSvgDrawerOpen] = useState(false);
  const [canvasLoaded, setCanvasLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useCurrentUser();
  const { yDoc, provider, connectionStatus, synced } = useYjsConnection(id, user);

  useYjsCircleSync(yDoc, fabricRef, canvasLoaded && synced);

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
        setCanvasLoaded(true);
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

  const handleBack = useCallback(() => {
    navigate("/example/canvas-yjs");
  }, [navigate]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Heading>Example &gt; Yjs Collab Canvas</Heading>
      <Text className="mt-2">
        Yjs CRDT 共同編集 — {canvasName || "Loading..."}
      </Text>

      <div className="mt-4 flex items-center gap-3">
        <ConnectionStatusBadge status={connectionStatus} synced={synced} />
        <ConnectedUsers provider={provider} />
        <div className="ml-auto">
          <Button type="button" outline onClick={handleBack}>
            Back to List
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
              skipInitialRect
              activeTool={activeTool}
              onShapePlaced={handleShapePlaced}
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
    </div>
  );
}
