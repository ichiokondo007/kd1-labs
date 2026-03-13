import type { FC } from "react";
import { Link } from "react-router-dom";
import type { BloglistViewModel } from "../types";

export const BloglistPage: FC<BloglistViewModel> = ({
  items,
  isLoading,
  errorMessage,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24" role="alert">
        <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white py-12 sm:py-16 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl dark:text-white">
            Tech Blog
          </h2>
          <p className="mt-2 text-lg/8 text-gray-600 dark:text-gray-400">
            Public articles and POC Results Report
          </p>

          {items.length === 0 ? (
            <p className="mt-16 text-gray-500 dark:text-gray-400">
              記事がありません
            </p>
          ) : (
            <div className="mt-16 space-y-20 lg:mt-20">
              {items.map((post) => (
                <article
                  key={post.slug}
                  className="relative isolate flex flex-col gap-8 lg:flex-row"
                >
                  <div className="relative aspect-video sm:aspect-2/1 lg:aspect-square lg:w-64 lg:shrink-0">
                    <img
                      alt=""
                      src={post.imageUrl}
                      className="absolute inset-0 size-full rounded-2xl bg-gray-50 object-cover dark:bg-zinc-800"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10 dark:ring-white/10" />
                  </div>

                  <div>
                    <div className="flex items-center gap-x-4 text-xs">
                      <time
                        dateTime={post.datetime}
                        className="text-gray-500 dark:text-gray-400"
                      >
                        {post.date}
                      </time>
                      <span className="rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 dark:bg-zinc-800 dark:text-gray-300">
                        {post.category.title}
                      </span>
                    </div>

                    <div className="group relative max-w-xl">
                      <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600 dark:text-white dark:group-hover:text-gray-300">
                        <Link to={`/blog/public/${post.slug}`}>
                          <span className="absolute inset-0" />
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-5 text-sm/6 text-gray-600 dark:text-gray-400">
                        {post.description}
                      </p>
                    </div>

                    <div className="mt-6 flex border-t border-gray-900/5 pt-6 dark:border-white/5">
                      <div className="flex items-center gap-x-4">
                        <div className="text-sm/6">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {post.author.name}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {post.author.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
