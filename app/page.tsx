import Link from "next/link";
import { vision } from "@/content/vision";
import { site } from "@/content/site";
import { VisionScene } from "@/components/home/VisionScene";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";

const explore = [
  { href: "/projects", title: "Projects", text: "V2X、デジタルツイン、故障診断。業務と個人開発のプロジェクト" },
  { href: "/experience", title: "Experience", text: "職務経歴と、クラウド・データ・エネルギー領域のスキルマップ" },
  { href: "/blog", title: "Blog", text: "設計判断や学びを書いた技術記事" },
];

function VisionStatement() {
  const [before, after] = vision.statement.split(vision.highlight);
  return (
    <p className="max-w-[920px] text-[1.75rem] leading-relaxed font-bold md:text-[2.5rem] md:leading-[1.6]">
      {before}
      <span className="text-amber">{vision.highlight}</span>
      {after}
    </p>
  );
}

export default function HomePage() {
  return (
    <>
      <VisionScene />

      <section id="vision" data-theme="night" className="border-t border-line bg-bg py-24 text-ink md:py-30">
        <div className="container-page flex flex-col gap-8">
          <span className="label text-amber">04 — VISION</span>
          <VisionStatement />
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-ink-muted">
              {site.name} — {site.role}
            </span>
            <ButtonLink href="/projects">プロジェクトを見る</ButtonLink>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container-page flex flex-col gap-12">
          <SectionHeading label="EXPLORE" title="ビジョンの、その先へ" />
          <div className="grid gap-6 md:grid-cols-3">
            {explore.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col gap-4 rounded-lg border border-line px-6 py-8 text-ink no-underline transition-colors hover:border-line-strong hover:text-ink"
              >
                <span className="label text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-2xl font-bold">{item.title}</span>
                <span className="text-sm leading-relaxed text-ink-muted">{item.text}</span>
                <span className="mt-auto text-sm font-bold text-link">見る →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
