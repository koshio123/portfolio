import Link from "next/link";
import { formatDate, type Post } from "@/lib/blog";

/** 記事のサムネイル。OGP画像と同じ夜色のデザイン */
function PostThumb({ title, large = false }: { title: string; large?: boolean }) {
  return (
    <div
      data-theme="night"
      className={`flex flex-col justify-between gap-6 bg-bg text-ink ${large ? "min-h-64 p-8" : "h-36 p-5"}`}
    >
      <span className="label text-link">BLOG</span>
      <span className={`font-bold leading-normal ${large ? "text-2xl" : "text-[15px]"}`}>{title}</span>
      {large && (
        <span aria-hidden className="flex gap-1.5">
          <span className="h-1 w-6 rounded-xs bg-cyan" />
          <span className="h-1 w-3 rounded-xs bg-amber" />
        </span>
      )}
    </div>
  );
}

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  if (featured) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="grid overflow-hidden rounded-lg border border-line text-ink no-underline hover:border-line-strong hover:text-ink md:grid-cols-2"
      >
        <PostThumb title={post.title} large />
        <div className="flex flex-col justify-center gap-3 p-8">
          <span className="label text-ink-muted">LATEST · {formatDate(post.date)}</span>
          <h2 className="text-2xl leading-normal font-bold">{post.title}</h2>
          <p className="text-ink-muted">{post.summary}</p>
          <p className="flex flex-wrap gap-2 font-mono text-xs text-ink-muted">
            {post.tags.map((t) => (
              <span key={t} className="rounded-sm border border-line-strong px-2.5 py-0.5">
                {t}
              </span>
            ))}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex flex-col overflow-hidden rounded-lg border border-line text-ink no-underline hover:border-line-strong hover:text-ink"
    >
      <PostThumb title={post.title} />
      <div className="flex flex-col gap-2 p-5">
        <span className="font-mono text-xs text-ink-muted">{formatDate(post.date)}</span>
        <h3 className="leading-relaxed font-bold">{post.title}</h3>
        <span className="text-xs text-ink-muted">{post.tags.join(" · ")}</span>
      </div>
    </Link>
  );
}
