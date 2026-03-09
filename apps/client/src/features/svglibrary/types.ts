import type { SvgAssetItem } from "@kd1-labs/types";

export type { SvgAssetItem };

export type SvglibraryViewModel = {
  items: SvgAssetItem[];
  isLoading: boolean;
  errorMessage?: string;
};

export type SvgUploadViewModel = {
  title: string;
  svgSource: string;
  isUploading: boolean;
  errorMessage?: string;
  setTitle: (v: string) => void;
  setSvgSource: (v: string) => void;
  upload: () => Promise<boolean>;
  reset: () => void;
};
