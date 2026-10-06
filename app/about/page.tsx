import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/content/site";
import { vision } from "@/content/vision";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DownloadIcon, GitHubIcon, LinkedInIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "About",
  description: "自己紹介、大切にしていること、連絡先",
};

const intro = "主に自動車 / エネルギーの領域でソフトウェアを開発してきた犬好きエンジニア";

const values = [
  { title: "[価値観1]", text: "[説明]" },
  { title: "[価値観2]", text: "[説明]" },
  { title: "[価値観3]", text: "[説明]" },
];

const contacts = [
  { label: "GitHub", href: site.links.github, Icon: GitHubIcon },
  { label: "LinkedIn", href: site.links.linkedin, Icon: LinkedInIcon },
];

export default function AboutPage() {
  const [before, after] = vision.statement.split(vision.highlight);

  return (
    <div className="container-page flex flex-col gap-24 py-20">
      <section className="flex flex-wrap items-center gap-14">
        <Image
          src="/profile.jpg"
          alt="プロフィール画像"
          width={400}
          height={400}
          priority
          className="aspect-square w-full max-w-[320px] flex-[0_1_320px] rounded-lg object-cover"
        />
        <div className="flex flex-[1_1_420px] flex-col gap-5">
          <span className="label text-ink-muted">ABOUT</span>
          <h1 className="text-h1 font-bold">{site.name}</h1>
          <p className="text-ink-muted">{site.role}</p>
          <p className="leading-[1.9]">{intro}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {site.resumePdf && (
              <a
                href={site.resumePdf}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary-bg px-6 text-sm font-bold text-primary-ink no-underline hover:text-primary-ink hover:opacity-90"
              >
                <DownloadIcon />
                職務経歴書(PDF)
              </a>
            )}
            <ButtonLink href="#contact" variant="secondary">
              連絡先
            </ButtonLink>
          </div>
        </div>
      </section>

      <section data-theme="night" className="flex flex-col gap-6 rounded-2xl bg-bg px-6 py-12 text-ink md:px-12 md:py-14">
        <span className="label text-amber">VISION</span>
        <p className="max-w-[880px] text-xl leading-[1.7] font-bold md:text-[1.75rem]">
          {before}
          <span className="text-amber">{vision.highlight}</span>
          {after}
        </p>
        <ButtonLink href="/" variant="secondary" className="self-start">
          Homeで3Dシーンを見る →
        </ButtonLink>
      </section>

      <section className="flex flex-col gap-8">
        <SectionHeading label="VALUES" title="大切にしていること" />
        <ul className="grid gap-6 md:grid-cols-3">
          {values.map((v, i) => (
            <li key={i} className="flex flex-col gap-3 rounded-lg border border-line px-6 py-7">
              <span className="font-mono text-2xl font-medium text-link">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-h3 font-bold">{v.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="contact" className="flex scroll-mt-8 flex-col gap-6">
        <SectionHeading label="CONTACT" title="連絡先" />
        <ul className="grid gap-4 md:grid-cols-2">
          {contacts.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                className="flex items-center gap-4 rounded-lg bg-surface px-6 py-5 text-ink no-underline hover:text-link"
              >
                <span data-theme="night" className="inline-flex size-11 items-center justify-center rounded-md bg-bg text-ink">
                  <Icon />
                </span>
                <span className="font-bold">{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
