import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPost, getPostSlugs } from "@/lib/blog";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPostSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  return post
    ? { title: post.title, description: post.summary, openGraph: { type: "article", publishedTime: post.date } }
    : {};
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) notFound();
  const { Content } = post;

  return (
    <article className="container-page py-20">
      <div className="mx-auto max-w-[720px]">
        <nav aria-label="パンくず" className="text-sm text-ink-muted">
          <Link href="/blog">Blog</Link>
        </nav>
        <header className="mt-6 flex flex-col gap-4 border-b border-line pb-10">
          <time dateTime={post.date} className="label text-ink-muted">
            {formatDate(post.date)}
          </time>
          <h1 className="text-[2rem] leading-snug font-bold md:text-h1">{post.title}</h1>
          <p className="flex flex-wrap gap-2 font-mono text-xs text-ink-muted">
            {post.tags.map((t) => (
              <span key={t} className="rounded-sm border border-line-strong px-2.5 py-0.5">
                {t}
              </span>
            ))}
          </p>
        </header>
        <div className="mt-6">
          <Content />
        </div>
      </div>
    </article>
  );
}
