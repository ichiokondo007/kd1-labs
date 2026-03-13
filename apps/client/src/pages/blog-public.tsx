import { BloglistPage } from "@/features/bloglist/ui";
import { useBloglist } from "@/features/bloglist/hooks";

export default function BlogPublicPageEntry() {
  const vm = useBloglist();
  return <BloglistPage {...vm} />;
}
