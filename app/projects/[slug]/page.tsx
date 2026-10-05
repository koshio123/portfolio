import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { ArchitectureDiagram } from "@/components/projects/ArchitectureDiagram";
import { KindTag, TechChip } from "@/components/ui/Tag";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);
  return project ? { title: project.title, description: project.summary } : {};
}

const sections = [
  { id: "overview", label: "01 OVERVIEW", title: "概要" },
  { id: "architecture", label: "02 ARCHITECTURE", title: "全体図 or 画面" },
  { id: "problem", label: "03 PROBLEM", title: "課題" },
  { id: "role", label: "04 ROLE", title: "担当" },
  { id: "design", label: "05 DESIGN", title: "設計のポイント" },
  { id: "outcome", label: "06 OUTCOME", title: "成果" },
  { id: "stack", label: "07 STACK", title: "技術スタック" },
] as const;

type SectionId = (typeof sections)[number]["id"];

function Section({ id, children }: { id: SectionId; children: React.ReactNode }) {
  const s = sections.find((x) => x.id === id)!;
  return (
    <section id={id} className="flex scroll-mt-8 flex-col gap-4">
      <span className="label text-ink-muted">{s.label}</span>
      <h2 className="text-h2 font-bold">{s.title}</h2>
      {children}
    </section>
  );
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const prev = projects[index - 1];
  const next = projects[index + 1];
  const visible = sections.filter(
    (s) => (s.id !== "design" || project.decisions.length) && (s.id !== "outcome" || project.outcomes.length),
  );

  return (
    <article>
      <div className="border-b border-line bg-surface">
        <div className="container-page flex flex-col gap-4 pt-14 pb-12">
          <nav aria-label="パンくず" className="text-sm text-ink-muted">
            <Link href="/projects">Projects</Link> / {project.title}
          </nav>
          <KindTag kind={project.kind} />
          <h1 className="text-h1 font-bold">{project.title}</h1>
          <dl className="mt-2 flex flex-wrap gap-10">
            {[
              ["PERIOD", project.period],
              ["TYPE", project.kind === "work" ? "業務" : "個人開発"],
              ["TEAM", project.team],
            ].map(([dt, dd]) => (
              <div key={dt} className="flex flex-col gap-1">
                <dt className="label text-ink-muted">{dt}</dt>
                <dd>{dd}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="container-page flex flex-wrap items-start gap-16 py-16">
        <nav aria-label="目次" className="flex flex-[0_1_200px] flex-col gap-3.5 text-sm md:sticky md:top-8">
          <span className="label text-ink-muted">CONTENTS</span>
          {visible.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="text-ink-muted no-underline hover:text-link">
              {s.title}
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-20">
          <Section id="overview">
            <p className="text-xl leading-relaxed font-bold">{project.summary}</p>
          </Section>

          <Section id="architecture">
            {project.screenshot ? (
              <Image
                src={project.screenshot}
                alt={`${project.title}の画面`}
                width={1600}
                height={1000}
                className="h-auto w-full rounded-lg border border-line"
              />
            ) : (
              <ArchitectureDiagram nodes={project.diagram.nodes} caption={project.diagram.caption} />
            )}
          </Section>

          <Section id="problem">
            <div className="grid gap-6 md:grid-cols-2">
              {(
                [
                  ["技術課題", project.problems.technical],
                  ["ビジネス課題", project.problems.business],
                ] as const
              )
                .filter(([, items]) => items.length)
                .map(([title, items]) => (
                  <div key={title} className="flex flex-col gap-3 rounded-lg border border-line p-6">
                    <h3 className="text-h3 font-bold">{title}</h3>
                    <ul className="list-disc pl-5">
                      {items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </Section>

          <Section id="role">
            <ul className="flex flex-wrap gap-2" aria-label="担当領域">
              {project.role.areas.map((area) => (
                <li key={area} data-theme="night" className="rounded-full bg-bg px-4 py-1.5 text-sm text-link">
                  {area}
                </li>
              ))}
            </ul>
            {project.role.notes.length > 0 && (
              <ul className="list-disc pl-5">
                {project.role.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
          </Section>

          {project.decisions.length > 0 && (
            <Section id="design">
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm leading-relaxed">
                  <thead data-theme="night" className="bg-bg text-ink">
                    <tr>
                      <th className="px-5 py-3.5">論点</th>
                      <th className="px-5 py-3.5">選択肢</th>
                      <th className="px-5 py-3.5 text-link">採用</th>
                      <th className="px-5 py-3.5">理由・トレードオフ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.decisions.map((d) => (
                      <tr key={d.topic} className="border-t border-line even:bg-surface">
                        <td className="px-5 py-4 font-bold">{d.topic}</td>
                        <td className="px-5 py-4 text-ink-muted">{d.options.join(" / ")}</td>
                        <td className="px-5 py-4 font-bold">{d.chosen}</td>
                        <td className="px-5 py-4 text-ink-muted">{d.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {project.outcomes.length > 0 && (
            <Section id="outcome">
              <dl className="grid gap-4 sm:grid-cols-3">
                {project.outcomes.map((o) => (
                  <div key={o.label + o.value} className="flex flex-col-reverse gap-2 rounded-lg bg-surface px-6 py-7">
                    <dt className="text-sm text-ink-muted">{o.label}</dt>
                    <dd className="text-4xl leading-tight font-bold">{o.value}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          <Section id="stack">
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <li key={s}>
                  <TechChip>{s}</TechChip>
                </li>
              ))}
            </ul>
          </Section>

          <nav aria-label="前後のプロジェクト" className="grid gap-4 sm:grid-cols-2">
            {[prev, next].map((p, i) =>
              p ? (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className={`flex flex-col gap-1.5 rounded-lg border border-line p-6 text-ink no-underline hover:border-line-strong hover:text-ink ${i === 1 ? "items-end sm:col-start-2" : ""}`}
                >
                  <span className="label text-ink-muted">{i === 0 ? "← PREV" : "NEXT →"}</span>
                  <span className="text-lg font-bold">{p.title}</span>
                </Link>
              ) : null,
            )}
          </nav>
        </div>
      </div>
    </article>
  );
}
