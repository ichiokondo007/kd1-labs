import { useEffect, useRef, useState, useCallback } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import mermaid from "mermaid";
import "highlight.js/styles/github-dark-dimmed.css";

mermaid.initialize({ startOnLoad: false, theme: "dark" });

/**
 * ```mermaid コードブロックを検知して mermaid で描画するコンポーネント
 */
function MermaidBlock({ children }: { children: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
    mermaid.render(id, children).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg;
    });
  }, [children]);

  return <div ref={ref} className="my-6 flex justify-center" />;
}

/**
 * react-markdown の code ブロックをカスタムレンダリング。
 * language が mermaid なら MermaidBlock に委譲する。
 */
function CodeBlock({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"code">) {
  const match = /language-(\w+)/.exec(className ?? "");
  const lang = match?.[1];
  const code = String(children).replace(/\n$/, "");

  if (lang === "mermaid") {
    return <MermaidBlock>{code}</MermaidBlock>;
  }

  // rehype-highlight が className を付与済みのブロックコードはそのまま描画
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

export default function BlogPublicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (!slug) return;

    const ac = new AbortController();

    (async () => {
      setIsLoading(true);
      setErrorMessage(undefined);
      try {
        const res = await fetch(`/md/${slug}.md`, { signal: ac.signal });
        if (!res.ok) throw new Error(`記事が見つかりません (${res.status})`);
        setContent(await res.text());
      } catch (e) {
        if (ac.signal.aborted) return;
        setErrorMessage(
          e instanceof Error ? e.message : "読み込みに失敗しました",
        );
      } finally {
        setIsLoading(false);
      }
    })();

    return () => ac.abort();
  }, [slug]);

  const components = useCallback(
    () => ({
      code: CodeBlock,
    }),
    [],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <p className="text-red-600 dark:text-red-400" role="alert">
          {errorMessage}
        </p>
        <Link
          to="/blog/public"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← 一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white py-12 sm:py-16 dark:bg-zinc-900">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <Link
          to="/blog/public"
          className="mb-8 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← 一覧に戻る
        </Link>

        <article className="prose prose-lg max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={components()}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
