type Props = {
  /** 等幅の小さなラベル(例:"01 OVERVIEW") */
  label: string;
  title: string;
  /** ページタイトルは h1、セクションは h2 */
  as?: "h1" | "h2";
  description?: string;
};

export function SectionHeading({ label, title, as: Heading = "h2", description }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="label text-ink-muted">{label}</span>
      <Heading className={`font-bold ${Heading === "h1" ? "text-h1" : "text-h2"}`}>{title}</Heading>
      {description && <p className="mt-1 max-w-2xl text-ink-muted">{description}</p>}
    </div>
  );
}
