import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { FabricCanvas, type FabricCanvasHandle } from "@/features/canvas/ui/FabricCanvas";
import {
  CanvasEditorToolbar,
  type CanvasTool,
} from "@/features/canvas/ui/CanvasEditorToolbar";

export default function CanvasEditorPage() {
  const navigate = useNavigate();
  const fabricRef = useRef<FabricCanvasHandle>(null);
  const [activeTool, setActiveTool] = useState<CanvasTool>("selection");
  const [canvasName, setCanvasName] = useState("");

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

  const handleSave = useCallback(() => {
    // TODO: fabricRef.current から toJSON() を取得してサーバへ送信
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Heading>Example &gt; Canvas Editor</Heading>
      <Text className="mt-2">
        Fabric.js のキャンバス編集画面です。ツールバーから図形を追加できます。
      </Text>

      {/* Canvas Name + Cancel / Save */}
      <div className="mt-4 flex items-center gap-3">
        <Input
          type="text"
          placeholder="Canvas Name"
          value={canvasName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCanvasName(e.target.value)
          }
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" outline onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" color="dark/zinc" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <CanvasEditorToolbar
          activeTool={activeTool}
          onToolChange={handleToolChange}
        />
      </div>

      <div className="mt-3">
        <FabricCanvas ref={fabricRef} width={1000} height={619} />
      </div>
    </div>
  );
}