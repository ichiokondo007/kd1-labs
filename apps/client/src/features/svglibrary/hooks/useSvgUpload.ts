import { useCallback, useState } from "react";
import type { SvgUploadViewModel } from "../types";
import { uploadSvgAsset } from "../services";
import { validateTitle, validateSvgSource } from "../domain";

export function useSvgUpload(onSuccess?: () => void): SvgUploadViewModel {
  const [title, setTitle] = useState("");
  const [svgSource, setSvgSource] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const upload = useCallback(async (): Promise<boolean> => {
    const titleResult = validateTitle(title);
    if (!titleResult.ok) {
      setErrorMessage(titleResult.reason);
      return false;
    }
    const srcResult = validateSvgSource(svgSource);
    if (!srcResult.ok) {
      setErrorMessage(srcResult.reason);
      return false;
    }

    setIsUploading(true);
    setErrorMessage(undefined);
    try {
      await uploadSvgAsset(title.trim(), svgSource.trim());
      setTitle("");
      setSvgSource("");
      onSuccess?.();
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "アップロードに失敗しました";
      setErrorMessage(msg);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [title, svgSource, onSuccess]);

  const reset = useCallback(() => {
    setTitle("");
    setSvgSource("");
    setErrorMessage(undefined);
  }, []);

  return { title, svgSource, isUploading, errorMessage, setTitle, setSvgSource, upload, reset };
}
