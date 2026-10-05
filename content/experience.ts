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
    period: "[YYYY.MM] – 現在",
    company: "[会社名]",
    title: "[役職] — EVを活用したエネルギーマネジメントシステムの開発",
    current: true,
    highlights: ["[主な業務・成果]", "[主な業務・成果]"],
    projects: ["v2x-smart-charging", "digital-twin-platform", "fault-diagnosis"],
  },
  {
    period: "[YYYY.MM] – [YYYY.MM]",
    company: "[会社名]",
    title: "[役職]",
    highlights: ["[主な業務・成果]"],
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
