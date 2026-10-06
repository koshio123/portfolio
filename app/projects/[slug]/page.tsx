import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, kindLabel, projects } from "@/content/projects";
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
  { id: "overview", label: "OVERVIEW", title: "概要" },
  { id: "image", label: "IMAGE", title: "イメージ図" },
  { id: "problem", label: "PROBLEM", title: "課題" },
  { id: "role", label: "ROLE", title: "担当" },
  { id: "design", label: "DESIGN", title: "設計のポイント" },
  { id: "outcome", label: "OUTCOME", title: "成果" },
  { id: "stack", label: "STACK", title: "技術スタック" },
] as const;

type SectionInfo = (typeof sections)[number];

/** 見出しつきのセクション。番号は、そのプロジェクトで表示するセクションの順に振る */
function Section({ info, number, children }: { info: SectionInfo; number: number; children: React.ReactNode }) {
  return (
    <section id={info.id} className="flex scroll-mt-8 flex-col gap-4">
      <span className="label text-ink-muted">
        {String(number).padStart(2, "0")} {info.label}
      </span>
      <h2 className="text-h2 font-bold">{info.title}</h2>
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
  const { role, problems, decisions = [], outcomes = [] } = project;
  const problemGroups = (
    [
      ["解決したい課題", problems?.purpose ?? []],
      ["技術課題", problems?.technical ?? []],
    ] as const
  ).filter(([, items]) => items.length > 0);

  // 中身のあるセクションだけを出す
  const content: Record<SectionInfo["id"], boolean> = {
    overview: true,
    image: project.image !== undefined,
    problem: problemGroups.length > 0,
    role: role !== undefined,
    design: decisions.length > 0,
    outcome: outcomes.length > 0,
    stack: true,
  };
  const visible = sections.filter((s) => content[s.id]);
  const section = (id: SectionInfo["id"], children: React.ReactNode) => {
    const i = visible.findIndex((s) => s.id === id);
    return i < 0 ? null : (
      <Section info={visible[i]} number={i + 1}>
        {children}
      </Section>
    );
  };

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
              ["TYPE", kindLabel[project.kind]],
            ].map(([dt, dd]) => (
              <div key={dt} className="flex flex-col gap-1">
                <dt className="label text-ink-muted">{dt}</dt>
                <dd>{dd}</dd>
              </div>
            ))}
            {project.repo && (
              <div className="flex flex-col gap-1">
                <dt className="label text-ink-muted">REPOSITORY</dt>
                <dd>
                  <a href={project.repo}>{project.repo.replace("https://", "")}</a>
                </dd>
              </div>
            )}
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
          {section("overview", <p className="text-xl leading-relaxed font-bold">{project.summary}</p>)}

          {section(
            "image",
            project.image ? (
              <Image
                src={project.image.src}
                alt={project.image.alt}
                width={project.image.width}
                height={project.image.height}
                className="h-auto w-full rounded-lg border border-line"
              />
            ) : null,
          )}

          {section(
            "problem",
            <div className="grid gap-6 md:grid-cols-2">
              {problemGroups.map(([title, items]) => (
                <div key={title} className="flex flex-col gap-3 rounded-lg border border-line p-6">
                  <h3 className="text-h3 font-bold">{title}</h3>
                  <ul className="list-disc pl-5">
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>,
          )}

          {role &&
            section(
              "role",
              <>
                <ul className="flex flex-wrap gap-2" aria-label="担当領域">
                  {role.areas.map((area) => (
                    <li key={area} data-theme="night" className="rounded-full bg-bg px-4 py-1.5 text-sm text-link">
                      {area}
                    </li>
                  ))}
                </ul>
                {role.notes.length > 0 && (
                  <ul className="list-disc pl-5">
                    {role.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                )}
              </>,
            )}

          {section(
            "design",
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
                  {decisions.map((d) => (
                    <tr key={d.topic} className="border-t border-line even:bg-surface">
                      <td className="px-5 py-4 font-bold">{d.topic}</td>
                      <td className="px-5 py-4 text-ink-muted">{d.options.join(" / ")}</td>
                      <td className="px-5 py-4 font-bold">{d.chosen}</td>
                      <td className="px-5 py-4 text-ink-muted">{d.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>,
          )}

          {section(
            "outcome",
            <dl className="grid gap-4 sm:grid-cols-3">
              {outcomes.map((o) => (
                <div key={o.label + o.value} className="flex flex-col-reverse gap-2 rounded-lg bg-surface px-6 py-7">
                  <dt className="text-sm text-ink-muted">{o.label}</dt>
                  <dd className="text-4xl leading-tight font-bold">{o.value}</dd>
                </div>
              ))}
            </dl>,
          )}

          {section(
            "stack",
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <li key={s}>
                  <TechChip>{s}</TechChip>
                </li>
              ))}
            </ul>,
          )}

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
