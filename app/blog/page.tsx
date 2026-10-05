import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PostCard } from "@/components/blog/PostCard";

export const metadata: Metadata = {
  title: "Blog",
  description: "設計判断や学びを書いた技術記事",
};

export default async function BlogPage() {
  const [latest, ...rest] = await getAllPosts();

  return (
    <div className="container-page flex flex-col gap-12 py-20">
      <SectionHeading as="h1" label="BLOG" title="技術ブログ" description="[ページの説明 — 1行]" />
      {latest ? <PostCard post={latest} featured /> : <p className="text-ink-muted">記事はまだありません。</p>}
      {rest.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
