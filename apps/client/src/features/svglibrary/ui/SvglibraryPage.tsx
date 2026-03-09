import { useState, type FC } from "react";
import { Heading, Subheading } from "@/components/heading";
import { Text } from "@/components/text";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/button";
import { Field, Label, ErrorMessage } from "@/components/fieldset";
import { Divider } from "@/components/divider";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useSvglibrary, useSvgUpload } from "../hooks";

export const SvglibraryPage: FC = () => {
  const { items, isLoading, errorMessage, reload, removeItem } = useSvglibrary();
  const upload = useSvgUpload(reload);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Heading>SVG Assets Library</Heading>
      <Text className="mt-2">
        SVG アセットの登録・管理ページです。登録した SVG はキャンバスエディタの「登録画像」ボタンから利用できます。
      </Text>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* 一覧エリア */}
        <section>
          <Subheading>登録済み SVG</Subheading>
          <Divider className="mt-2 mb-4" />

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Text>読み込み中…</Text>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-md bg-red-50 p-3 dark:bg-red-950/30" role="alert">
              <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
            </div>
          )}

          {!isLoading && !errorMessage && items.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 py-16 dark:border-zinc-700">
              <Text>登録された SVG はありません</Text>
            </div>
          )}

          {!isLoading && items.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="group relative flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-3 transition hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded bg-zinc-50 p-2 dark:bg-zinc-900">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="w-full truncate text-center text-xs text-zinc-600 dark:text-zinc-400">
                    {item.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="absolute right-1.5 top-1.5 rounded p-1 text-zinc-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    aria-label={`${item.title} を削除`}
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 登録フォーム */}
        <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50 lg:self-start">
          <Subheading>SVG を登録</Subheading>
          <Divider className="mt-2 mb-4" />

          <div className="space-y-4">
            <Field>
              <Label>タイトル</Label>
              <Input
                type="text"
                placeholder="例: ダンプトラック"
                value={upload.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => upload.setTitle(e.target.value)}
              />
            </Field>

            <Field>
              <Label>SVG ソースコード</Label>
              <Textarea
                rows={8}
                placeholder="<svg ...>...</svg>"
                value={upload.svgSource}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => upload.setSvgSource(e.target.value)}
                className="font-mono text-xs"
              />
            </Field>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {showPreview ? "プレビューを閉じる" : "プレビュー"}
              </button>
            </div>

            {showPreview && upload.svgSource.trim() && (
              <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                <div
                  className="max-h-48 max-w-full [&>svg]:max-h-48 [&>svg]:max-w-full"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG preview from user input
                  dangerouslySetInnerHTML={{ __html: upload.svgSource }}
                />
              </div>
            )}

            {upload.errorMessage && (
              <ErrorMessage>{upload.errorMessage}</ErrorMessage>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                color="dark/zinc"
                onClick={upload.upload}
                disabled={upload.isUploading}
              >
                {upload.isUploading ? "保存中…" : "Save"}
              </Button>
              <Button type="button" outline onClick={upload.reset}>
                Reset
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
