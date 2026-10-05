/**
 * 職務経歴・スキル・資格のデータ。
 */

export type Career = {
  period: string;
  company: string;
  title: string;
  current?: boolean;
  highlights: string[];
  /** 関連するプロジェクトの slug */
  projects?: string[];
};

export type Skill = {
  name: string;
  /** 深さ 1〜5。未入力なら null */
  level: number | null;
  years: string;
};

export type SkillGroup = {
  key: string;
  label: string;
  title: string;
  /** 主要領域は夜色のカードで強調する */
  primary?: boolean;
  skills: Skill[];
};

export const careers: Career[] = [
  {
    period: "2025.01 – 現在",
    company: "トヨタ自動車",
    title: "Software Engineer — エネルギーマネジメントシステム",
    current: true,
    highlights: [
      "販売店・工場・家庭向けEVエネルギーマネジメント基盤のAWSバックエンド(Python、FastAPI、PostgreSQL)を設計・開発",
      "電力需要と再エネ発電量の時系列予測モデルを、試作から本番運用まで担当",
      "コスト・充電器の空き・運用制約を考慮したEV充放電の最適化エンジンを設計・開発",
      "事業部門・海外チーム・社外ベンダーと連携し、要件を本番システムに落とし込む",
    ],
    projects: ["v2x-smart-charging"],
  },
  {
    period: "2023.01 – 2024.12",
    company: "ウーブン・バイ・トヨタ(出向)",
    title: "Software Engineer — デジタルツインプラットフォーム",
    highlights: [
      "シミュレーションの設計・可視化・再生のためのフロントエンドと社内ツールを開発(Web、デスクトップ)",
      "3Dシナリオビルダー(React、Three.js)を設計・実装し、シナリオ作成を効率化",
      "シミュレーションの分析とデバッグ用の可視化ダッシュボード(React、D3.js)を開発",
      "シミュレーション再生とシナリオ検証用のUnityデスクトップアプリを開発",
    ],
    projects: ["digital-twin-platform"],
  },
  {
    period: "2019.04 – 2022.12",
    company: "トヨタ自動車",
    title: "Software Engineer — 車両故障診断システム",
    highlights: [
      "市場車両のダウンタイム削減と早期検知のための故障診断システムを共同開発",
      "車載データ収集アプリと、故障事例分析用のWebアプリをフルスタックで開発",
      "機械学習で車両故障の検知と分類を行い、診断精度を向上",
      "要件定義から設計・実装・テスト・デプロイまで一貫して担当",
    ],
    projects: ["fault-diagnosis"],
  },
];

export const skillGroups: SkillGroup[] = [
  {
    key: "cloud",
    label: "CLOUD / BACKEND",
    title: "クラウド・バックエンド",
    primary: true,
    skills: [
      { name: "AWS", level: null, years: "[n]" },
      { name: "Python / FastAPI", level: null, years: "[n]" },
      { name: "PostgreSQL", level: null, years: "[n]" },
      { name: "API設計", level: null, years: "[n]" },
    ],
  },
  {
    key: "data",
    label: "DATA / ML",
    title: "データ・機械学習",
    skills: [
      { name: "[スキル]", level: null, years: "[n]" },
      { name: "[スキル]", level: null, years: "[n]" },
    ],
  },
  {
    key: "simulation",
    label: "SIMULATION",
    title: "シミュレーション",
    skills: [
      { name: "車両シミュレーション", level: null, years: "[n]" },
      { name: "[スキル]", level: null, years: "[n]" },
    ],
  },
  {
    key: "energy",
    label: "ENERGY / MOBILITY",
    title: "エネルギー・モビリティ",
    skills: [
      { name: "V1G / V2G", level: null, years: "[n]" },
      { name: "VPP", level: null, years: "[n]" },
      { name: "充電行動予測", level: null, years: "[n]" },
    ],
  },
];

export const certifications: { year: string; name: string }[] = [
  { year: "[YYYY]", name: "[資格名]" },
  { year: "[YYYY]", name: "[資格名・受賞]" },
];
