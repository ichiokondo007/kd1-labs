import { useCallback } from "react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { CanvasListTable } from "@/components/canvas-list-table";
import { useYjsCanvasList } from "@/features/canvas-yjs/hooks";
import { CollabStatusBadge } from "@/features/canvas-yjs/ui";
import type { CanvasListItem } from "@kd1-labs/types";
import type { YjsCanvasListItem } from "@/features/canvas-yjs/types";

const getItemHref = (item: CanvasListItem) => `/example/canvas-yjs/${item.id}`;

export default function CanvasYjsListPage() {
  const { items, isLoading, errorMessage } = useYjsCanvasList();

  const renderItemExtra = useCallback(
    (item: CanvasListItem) => {
      const yjsItem = items.find((i) => i.id === item.id) as
        | YjsCanvasListItem
        | undefined;
      if (!yjsItem) return null;
      return (
        <CollabStatusBadge
          status={yjsItem.collabStatus}
          activeEditors={yjsItem.activeEditors}
        />
      );
    },
    [items],
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Heading>
        <img src="/yjs.avif" alt="" className="inline-block size-6 align-middle mr-1" />
        POC &gt; Yjs Collab Canvas
      </Heading>
      <Text className="mt-2">
        Yjs CRDT を用いた Canvas 共同編集
      </Text>

      <CanvasListTable
        items={items}
        isLoading={isLoading}
        errorMessage={errorMessage}
        getItemHref={getItemHref}
        renderItemExtra={renderItemExtra}
      />
    </div>
  );
}
