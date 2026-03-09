import type { FC } from "react";
import { Drawer, DrawerHeader, DrawerBody } from "@/components/drawer";
import { useSvglibrary } from "../hooks";
import type { SvgAssetItem } from "../types";

export type SvgAssetsDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (item: SvgAssetItem) => void;
};

export const SvgAssetsDrawer: FC<SvgAssetsDrawerProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const { items, isLoading, errorMessage } = useSvglibrary();

  return (
    <Drawer open={open} onClose={onClose} size="sm" position="right">
      <DrawerHeader title="SVG Assets Library" onClose={onClose} />
      <DrawerBody>
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">読み込み中…</p>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-md bg-red-50 p-3 dark:bg-red-950/30" role="alert">
            <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
          </div>
        )}

        {!isLoading && !errorMessage && items.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              登録された SVG はありません
            </p>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item)}
                className="group flex flex-col items-center gap-1.5 rounded-lg border border-zinc-200 bg-white p-2 transition hover:border-blue-400 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-500"
                title={item.title}
              >
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded bg-zinc-50 p-1 dark:bg-zinc-900">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="w-full truncate text-center text-xs text-zinc-600 group-hover:text-blue-600 dark:text-zinc-400 dark:group-hover:text-blue-400">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </DrawerBody>
    </Drawer>
  );
};
