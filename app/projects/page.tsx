import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectsBrowser } from "@/components/projects/ProjectsBrowser";

export const metadata: Metadata = {
  title: "Projects",
  description: "業務プロジェクトと個人開発",
};

export default function ProjectsPage() {
  return (
    <div className="container-page flex flex-col gap-12 py-20">
      <SectionHeading as="h1" label="PROJECTS" title="プロジェクト" description="業務と個人開発で取り組んだプロジェクト" />
      <ProjectsBrowser projects={projects} />
    </div>
  );
}
