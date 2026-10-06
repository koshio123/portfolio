/**
 * プロジェクトのデータ。詳細ページはこの配列から自動生成される。
 * 業務は「概要・担当・技術スタック」まで、個人開発は「課題・設計のポイント・成果」も書く。
 */

export type ProjectKind = "work" | "personal";

export type Project = {
  slug: string;
  title: string;
  kind: ProjectKind;
  /** 概要:何を、誰のために作ったか(1〜2行) */
  summary: string;
  period: string;
  /** 画面や構成図の画像(public/ 以下のパス)。あるときだけ「イメージ図」として表示する */
  image?: { src: string; alt: string; width: number; height: number };
  stack: string[];

  // 業務プロジェクトだけ(詳細は公開できないので、担当までにとどめる)
  /** 担当:areas は担当した工程、notes は主担当など */
  role?: { areas: string[]; notes: string[] };

  // 個人開発だけ(すべて自分で担当するので、担当は書かない)
  /** 課題:purpose は誰のどんな困りごとを解くか、technical は実現するうえでの技術課題 */
  problems?: { purpose: string[]; technical: string[] };
  decisions?: { topic: string; options: string[]; chosen: string; reason: string }[];
  outcomes?: { value: string; label: string }[];
};

export const projects: Project[] = [
  {
    slug: "v2x-smart-charging",
    title: "V2X(EVスマート充電)",
    kind: "work",
    summary:
      "販売店・工場・家庭のEVを対象に、車両やユーザビリティの制約を考慮しつつ、電力コストを抑える充放電計画を自動で作る基盤",
    period: "2025.01 – 現在",
    role: {
      areas: ["要件定義", "設計", "実装", "テスト", "運用"],
      notes: ["主担当:需要電力と、再生可能エネルギーによる発電電力の予測", "主担当:数理最適化を用いた充放電スケジューリング"],
    },
    stack: ["Python", "FastAPI", "PostgreSQL", "AWS", "時系列予測", "数理最適化"],
  },
  {
    slug: "digital-twin-platform",
    title: "デジタルツインプラットフォーム",
    kind: "work",
    summary:
      "シミュレーションエンジニア向けに、デジタルツイン上のシナリオの作成・可視化・再生を行うWebとデスクトップのツール群",
    period: "2023.01 – 2024.12",
    role: {
      areas: ["設計", "実装"],
      notes: [
        "3Dシナリオビルダー(React、Three.js)",
        "分析・デバッグ用の可視化ダッシュボード(React、D3.js)",
        "シミュレーション再生・シナリオ検証用のデスクトップアプリ(Unity)",
      ],
    },
    stack: ["TypeScript", "React", "Three.js", "D3.js", "Unity", "C#"],
  },
  {
    slug: "fault-diagnosis",
    title: "自動故障診断システム",
    kind: "work",
    summary: "市場を走る車両のデータから故障を早期に検知・分類し、ダウンタイムを減らすための診断システム",
    period: "2019.04 – 2022.12",
    role: {
      areas: ["要件定義", "設計", "実装", "テスト", "デプロイ"],
      notes: ["車載データ収集アプリと、故障事例分析用のWebアプリ", "機械学習による故障の検知・分類"],
    },
    stack: ["MATLAB / Simulink", "C", "Python", "Flask", "Oracle DB"],
  },
  {
    slug: "personal-project-1",
    title: "[個人開発プロジェクト名]",
    kind: "personal",
    summary: "[概要]",
    period: "[YYYY.MM – ]",
    problems: { purpose: ["[誰の、どんな困りごとを解くか]"], technical: ["[課題1]"] },
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
