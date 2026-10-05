"use client";

import { useState } from "react";
import type { Project } from "@/content/projects";
import { ProjectCard } from "./ProjectCard";

const filters = [
  { key: "all", label: "すべて" },
  { key: "work", label: "業務" },
  { key: "personal", label: "個人開発" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

/** 種別での絞り込みと、業務・個人開発のセクション表示 */
export function ProjectsBrowser({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const work = projects.filter((p) => p.kind === "work");
  const personal = projects.filter((p) => p.kind === "personal");

  return (
    <div className="flex flex-col gap-12">
      <div role="group" aria-label="種別で絞り込む" className="flex flex-wrap gap-2">
        {filters.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(key)}
              className={`min-h-11 rounded-full border px-5 text-sm ${
                active
                  ? "border-primary-bg bg-primary-bg font-bold text-primary-ink"
                  : "border-line-strong bg-bg text-ink hover:bg-surface"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filter !== "personal" && work.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-h2 font-bold">業務プロジェクト</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {work.map((p) => (
              <ProjectCard key={p.slug} project={p} large />
            ))}
          </div>
        </section>
      )}

      {filter !== "work" && personal.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-h2 font-bold">個人開発</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {personal.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
