import fs from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";

/** content/blog/*.mdx の先頭で export する metadata の型 */
export type PostMeta = {
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  tags: string[];
};

export type Post = PostMeta & { slug: string };

const BLOG_DIR = path.join(process.cwd(), "content/blog");

async function loadPost(slug: string) {
  const mod = (await import(`@/content/blog/${slug}.mdx`)) as {
    default: ComponentType;
    metadata: PostMeta;
  };
  return mod;
}

export async function getPostSlugs() {
  const files = await fs.readdir(BLOG_DIR);
  return files.filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
}

/** 新しい順の記事一覧 */
export async function getAllPosts(): Promise<Post[]> {
  const slugs = await getPostSlugs();
  const posts = await Promise.all(
    slugs.map(async (slug) => ({ slug, ...(await loadPost(slug)).metadata })),
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string) {
  const slugs = await getPostSlugs();
  if (!slugs.includes(slug)) return null;
  const { default: Content, metadata } = await loadPost(slug);
  return { slug, Content, ...metadata };
}

/** 2026-10-05 → 2026.10.05 */
export function formatDate(date: string) {
  return date.replaceAll("-", ".");
}
