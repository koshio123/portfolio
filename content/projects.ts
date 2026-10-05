/**
 * プロジェクトのデータ。詳細ページはこの配列から自動生成される。
 * [ ] のプレースホルダーを実際の内容に置き換える。
 */

export type ProjectKind = "work" | "personal";

export type DiagramNode = {
  label: string;
  /** 主役の要素(夜色の箱で強調)。1枚の図で1〜2個まで */
  main?: boolean;
};

export type Project = {
  slug: string;
  title: string;
  kind: ProjectKind;
  /** 概要:何を、誰のために作ったか(1〜2行) */
  summary: string;
  period: string;
  team: string;
  /** 全体図。左から右へ流れる箱の並び */
  diagram: { nodes: DiagramNode[]; caption: string };
  /** 全体図の代わりに画面を見せる場合の画像(public/ 以下のパス) */
  screenshot?: string;
  problems: { technical: string[]; business: string[] };
  role: { areas: string[]; notes: string[] };
  decisions: { topic: string; options: string[]; chosen: string; reason: string }[];
  outcomes: { value: string; label: string }[];
  stack: string[];
};

export const projects: Project[] = [
  {
    slug: "v2x-smart-charging",
    title: "V2X(EVスマート充電)",
    kind: "work",
    summary: "[何を、誰のために作ったか — 1〜2行]",
    period: "[YYYY.MM – YYYY.MM]",
    team: "[人数・体制]",
    diagram: {
      nodes: [
        { label: "車両・充電器" },
        { label: "通信・ゲートウェイ" },
        { label: "クラウド基盤", main: true },
        { label: "外部システム" },
      ],
      caption: "図1 抽象化したアーキテクチャ",
    },
    problems: { technical: ["[課題1]", "[課題2]"], business: ["[課題1]", "[課題2]"] },
    role: { areas: ["[要件定義]", "[設計]", "[実装]"], notes: ["[担当範囲の説明]", "[規模感]"] },
    decisions: [
      { topic: "[論点1]", options: ["[A]", "[B]"], chosen: "[A]", reason: "[理由]" },
      { topic: "[論点2]", options: ["[A]", "[B]", "[C]"], chosen: "[B]", reason: "[理由]" },
    ],
    outcomes: [
      { value: "[数値]", label: "[指標名]" },
      { value: "[数値]", label: "[指標名]" },
    ],
    stack: ["[言語]", "[フレームワーク]", "[データベース]", "[クラウド]"],
  },
  {
    slug: "digital-twin-platform",
    title: "デジタルツインプラットフォーム",
    kind: "work",
    summary: "[何を、誰のために作ったか — 1〜2行]",
    period: "[YYYY.MM – YYYY.MM]",
    team: "[人数・体制]",
    diagram: {
      nodes: [{ label: "現実のデータ" }, { label: "ツイン", main: true }, { label: "可視化・分析" }],
      caption: "図1 抽象化したアーキテクチャ",
    },
    problems: { technical: ["[課題1]"], business: ["[課題1]"] },
    role: { areas: ["[設計]", "[実装]"], notes: ["[担当範囲の説明]"] },
    decisions: [{ topic: "[論点1]", options: ["[A]", "[B]"], chosen: "[A]", reason: "[理由]" }],
    outcomes: [{ value: "[数値]", label: "[指標名]" }],
    stack: ["[言語]", "[フレームワーク]"],
  },
  {
    slug: "fault-diagnosis",
    title: "自動故障診断システム",
    kind: "work",
    summary: "[何を、誰のために作ったか — 1〜2行]",
    period: "[YYYY.MM – YYYY.MM]",
    team: "[人数・体制]",
    diagram: {
      nodes: [{ label: "稼働データ" }, { label: "診断", main: true }, { label: "通知・対応" }],
      caption: "図1 抽象化したアーキテクチャ",
    },
    problems: { technical: ["[課題1]"], business: ["[課題1]"] },
    role: { areas: ["[設計]", "[実装]"], notes: ["[担当範囲の説明]"] },
    decisions: [{ topic: "[論点1]", options: ["[A]", "[B]"], chosen: "[A]", reason: "[理由]" }],
    outcomes: [{ value: "[数値]", label: "[指標名]" }],
    stack: ["[言語]", "[フレームワーク]"],
  },
  {
    slug: "personal-project-1",
    title: "[個人開発プロジェクト名]",
    kind: "personal",
    summary: "[概要]",
    period: "[YYYY.MM – ]",
    team: "個人",
    diagram: {
      nodes: [{ label: "[入力]" }, { label: "[処理]", main: true }, { label: "[出力]" }],
      caption: "図1 構成",
    },
    problems: { technical: ["[課題1]"], business: [] },
    role: { areas: ["企画", "設計", "実装"], notes: [] },
    decisions: [],
    outcomes: [],
    stack: ["[技術]"],
  },
];

export const kindLabel: Record<ProjectKind, string> = {
  work: "業務",
  personal: "個人開発",
};

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
