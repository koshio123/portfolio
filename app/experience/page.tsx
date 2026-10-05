import type { Metadata } from "next";
import Link from "next/link";
import { careers, certifications, domains, skillGroups, skillLevels, type Skill } from "@/content/experience";
import { getProject } from "@/content/projects";
import { site } from "@/content/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DownloadIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Experience",
  description: "職務経歴とスキルマップ",
};

function SkillMeter({ skill }: { skill: Skill }) {
  const { name, level, years } = skill;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-3 text-sm">
        <span>{name}</span>
        {years !== null && <span className="font-mono text-xs text-ink-muted">{years}年</span>}
      </div>
      {level !== null && (
        <div
          role="meter"
          aria-label={`${name}の深さ`}
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={level}
          className="grid grid-cols-5 gap-1"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={`h-1.5 rounded-xs ${n <= level ? "bg-link" : "bg-line"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExperiencePage() {
  return (
    <div className="container-page flex flex-col gap-24 py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading as="h1" label="EXPERIENCE" title="経歴" description="職務経歴、スキル、資格" />
        {site.resumePdf && (
          <a
            href={site.resumePdf}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary-bg px-6 text-sm font-bold text-primary-ink no-underline hover:text-primary-ink hover:opacity-90"
          >
            <DownloadIcon />
            職務経歴書(PDF)
          </a>
        )}
      </div>

      <section className="flex flex-col gap-8">
        <SectionHeading label="01 CAREER" title="職務経歴" />
        <ol className="flex flex-col border-b border-line">
          {careers.map((c) => (
            <li key={c.period + c.company} className="flex flex-wrap gap-6 border-t border-line py-8">
              <div className="flex flex-[0_1_200px] flex-col gap-2">
                <span className="font-mono text-sm text-ink-muted">{c.period}</span>
                {c.current && (
                  <span data-theme="night" className="self-start rounded-full bg-bg px-3 py-0.5 text-xs text-link">
                    現職
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-3">
                <h3 className="text-h3 font-bold">{c.company}</h3>
                <p className="text-sm text-ink-muted">{c.title}</p>
                <ul className="list-disc pl-5">
                  {c.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
                {c.projects && (
                  <p className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    {c.projects.map((slug) => {
                      const p = getProject(slug);
                      return p ? (
                        <Link key={slug} href={`/projects/${slug}`}>
                          {p.title} →
                        </Link>
                      ) : null;
                    })}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-8">
        <SectionHeading label="02 SKILLS" title="スキルマップ" description={`深さの5段階:${skillLevels.map((l, i) => `${i + 1} ${l}`).join(" / ")}`} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((g) => (
            <div
              key={g.key}
              data-theme={g.primary ? "night" : undefined}
              className={`flex flex-col gap-5 rounded-lg px-6 py-7 ${g.primary ? "bg-bg text-ink" : "border border-line"}`}
            >
              <div className="flex flex-col gap-1">
                <span className={`label ${g.primary ? "text-link" : "text-ink-muted"}`}>{g.label}</span>
                <h3 className="text-h3 font-bold">{g.title}</h3>
              </div>
              {g.skills.map((s, i) => (
                <SkillMeter key={i} skill={s} />
              ))}
            </div>
          ))}
          <div className="flex flex-col gap-5 rounded-lg bg-surface px-6 py-7">
            <div className="flex flex-col gap-1">
              <span className="label text-ink-muted">DOMAIN</span>
              <h3 className="text-h3 font-bold">ドメイン知識</h3>
            </div>
            <ul className="flex flex-col gap-3 text-sm">
              {domains.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <SectionHeading label="03 CERTIFICATIONS" title="資格" />
        <ul className="grid gap-4 md:grid-cols-3">
          {certifications.map((c, i) => (
            <li key={i} className="flex flex-col gap-1 rounded-lg bg-surface px-6 py-5">
              <span className="font-bold">{c.name}</span>
              <span className="text-xs text-ink-muted">{c.issuer}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
