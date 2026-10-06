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
  /** 深さ 1〜5。未入力(null)ならバーを出さない */
  level: number | null;
  /** 経験年数。未入力(null)なら出さない */
  years: number | null;
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
    title: "Software Engineer / Systems Engineer — エネルギーマネジメントシステム",
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
    company: "Woven by Toyota(出向)",
    title: "Software Engineer — Digital Twin Platform",
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

/**
 * スキルマップ。技術を「ソフトウェアのどの層か」で分ける(1つのスキルは1つの枠にだけ入れる)。
 * 業務領域の知識は技術と軸が違うので、下の domains に分けて書く。
 */
export const skillGroups: SkillGroup[] = [
  {
    key: "language",
    label: "LANGUAGES",
    title: "言語",
    skills: [
      { name: "Python", level: 4, years: null },
      { name: "TypeScript", level: 4, years: null },
      { name: "C#", level: 3, years: null },
      { name: "C", level: 2, years: null },
      { name: "MATLAB / Simulink", level: 4, years: null },
    ],
  },
  {
    key: "backend",
    label: "BACKEND / DATABASE",
    title: "バックエンド・データベース",
    primary: true,
    skills: [
      { name: "FastAPI", level: 4, years: null },
      { name: "Flask", level: 2, years: null },
      { name: "PostgreSQL", level: 4, years: null },
      { name: "Oracle DB", level: 2, years: null },
      { name: "API設計", level: 3, years: null },
    ],
  },
  {
    key: "frontend",
    label: "FRONTEND / 3D",
    title: "フロントエンド・3D",
    skills: [
      { name: "React", level: 3, years: null },
      { name: "Three.js", level: 3, years: null },
      { name: "D3.js", level: 3, years: null },
      { name: "Unity", level: 3, years: null },
    ],
  },
  {
    key: "cloud",
    label: "CLOUD / INFRA",
    title: "クラウド・インフラ",
    skills: [
      { name: "AWS", level: 4, years: null },
      { name: "Docker / Podman", level: 4, years: null },
      { name: "GitHub Actions", level: 3, years: null },
    ],
  },
  {
    key: "ml",
    label: "ML / OPTIMIZATION",
    title: "機械学習・最適化",
    skills: [
      { name: "時系列予測", level: 4, years: null },
      { name: "機械学習(分類・異常検知)", level: 4, years: null },
      { name: "数理最適化(制約付きスケジューリング)", level: 3, years: null },
    ],
  },
];

/** ドメイン知識(業務領域)。深さ・年数は付けない */
/** 深さ(level)の基準。スキルマップの凡例に出す */
export const skillLevels = ["学習", "業務経験", "独力で遂行", "設計をリード", "専門家"];

export const domains: string[] = [
  "車両開発全般",
  "エネルギーマネジメント(V2X)",
  "デジタルツイン・シミュレーション",
  "車両故障診断",
  "パワトレ制御(主にEV)",
];

export const certifications: { name: string; issuer: string }[] = [
  { name: "TOEIC 970", issuer: "国際ビジネスコミュニケーション協会(IIBC)" },
  { name: "AWS Certified Solutions Architect – Associate", issuer: "Amazon Web Services" },
  { name: "AWS Certified Developer – Associate", issuer: "Amazon Web Services" },
  { name: "AWS Certified Machine Learning – Associate", issuer: "Amazon Web Services" },
  { name: "E資格(Deep Learning for ENGINEER)", issuer: "日本ディープラーニング協会(JDLA)" },
  { name: "画像処理エンジニア検定 エキスパート", issuer: "CG-ARTS" },
  { name: "応用情報技術者試験", issuer: "情報処理推進機構(IPA)" },
];
