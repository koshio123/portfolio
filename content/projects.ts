/**
 * プロジェクトのデータ。詳細ページはこの配列から自動生成される。
 * 業務は「概要・担当・技術スタック」まで、個人開発は「課題・設計のポイント・成果」も書く。
 */

export type ProjectKind = "work" | "personal";

export type ProjectImage = {
  src: string;
  /** 画像の内容の説明(読み上げ用) */
  alt: string;
  /** 画像の下に出す説明 */
  caption?: string;
  width: number;
  height: number;
};

export type Project = {
  slug: string;
  title: string;
  kind: ProjectKind;
  /** 概要:何を、誰のために作ったか(1〜2行) */
  summary: string;
  period: string;
  /**
   * 画像(アーキテクチャ図、画面、イメージ図など)。public/projects/<slug>/ に置いてパスを書く。
   * 1枚目は一覧のカードにも出す。width・height は画像の実寸
   */
  images?: ProjectImage[];
  stack: string[];
  /** 公開している GitHub リポジトリの URL */
  repo?: string;

  // 業務プロジェクトだけ(詳細は公開できないので、担当までにとどめる)
  /** 担当:areas は担当した工程、notes は主担当など */
  role?: { areas: string[]; notes: string[] };

  // 個人開発だけ(すべて自分で担当するので、担当は書かない)
  /** 課題:purpose は誰のどんな困りごとを解くか、technical は実現するうえでの技術課題 */
  problems?: { purpose: string[]; technical: string[] };
  decisions?: {
    topic: string;
    options: string[];
    chosen: string;
    reason: string;
  }[];
  outcomes?: { value: string; label: string }[];
};

export const projects: Project[] = [
  {
    slug: "v2x-smart-charging",
    title: "V2X(EVスマート充電)",
    kind: "work",
    summary:
      "販売店・工場・家庭のEVを対象に、車両やユーザビリティの制約を考慮しつつ、電力コストを抑える充放電計画を自動でスケジューリングする基盤",
    period: "2025.01 – 現在",
    role: {
      areas: ["要件定義", "設計", "実装", "テスト", "運用"],
      notes: [
        "主担当: 需要電力と、再生可能エネルギーによる発電電力の予測",
        "主担当: 数理最適化を用いた充放電スケジューリング",
      ],
    },
    stack: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "AWS",
      "PyTorch",
      "Scikit Learn",
      "LightGBM",
      "Pyomo",
      "時系列予測",
      "数理最適化",
    ],
  },
  {
    slug: "digital-twin-platform",
    title: "デジタルツインプラットフォーム",
    kind: "work",
    summary:
      "シミュレーションエンジニア向けに、デジタルツイン上のシナリオの作成・可視化・再生を行うWebとデスクトップのツール群",
    period: "2023.01 – 2024.12",
    role: {
      areas: ["設計", "実装", "テスト"],
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
    summary:
      "市場を走る車両のデータから故障を早期に検知・分類し、ダウンタイムを減らすための自動故障診断Webシステム",
    period: "2019.04 – 2022.12",
    role: {
      areas: ["要件定義", "設計", "実装", "テスト", "デプロイ"],
      notes: [
        "車載データ収集アプリと、故障事例分析用のWebアプリ",
        "機械学習による故障の検知・分類",
      ],
    },
    stack: ["MATLAB / Simulink", "C", "Python", "Flask", "Oracle DB"],
  },
  {
    slug: "credit-memo-agent",
    title: "credit-memo-agent",
    kind: "personal",
    summary:
      "有価証券報告書を対象にRAGを構築し、出典つきの与信メモの草案を生成するマルチエージェント。生成した主張は検証エージェントが出典と照合し、財務比率はコードで再計算し検証する(開発中)",
    period: "2026.09 – 現在",
    repo: "https://github.com/koshio123/credit-memo-agent",
    images: [
      {
        src: "/projects/credit-memo-agent/memo.png",
        alt: "生成された与信メモの草案。主張ごとに出典番号と検証結果が付き、数値の算式が展開されている",
        caption: "生成した与信メモの草案。主張ごとに出典と検証結果(Verifier)が付き、数値は算式までたどれる",
        width: 893,
        height: 898,
      },
    ],
    problems: {
      purpose: [
        "有価証券報告書を読み込み、根拠を整理して与信メモにまとめる作業には時間がかかる",
        "生成AIの文章は、根拠がたどれないと審査資料として使えない",
      ],
      technical: [
        "生成した主張が出典の記述と一致しているかを検証し、合わないものは差し戻す",
        "財務数値の抽出と比率の計算で誤りを出さない",
        "PDFとXBRLから取り込んだ本文を、必要な箇所だけ検索して引用できるようにする",
      ],
    },
    decisions: [
      {
        topic: "財務比率の計算",
        options: ["LLMに計算させる", "コードで再計算する"],
        chosen: "コードで再計算する",
        reason:
          "数値の誤りを防ぎ、同じ入力から同じ結果を再現できるようにするため",
      },
      {
        topic: "本文の検索",
        options: ["全文検索のみ", "埋め込み検索のみ", "BM25と埋め込みの融合"],
        chosen: "BM25と埋め込みの融合",
        reason:
          "勘定科目などの語の一致と、言い換えを含む意味の近さの両方を拾うため",
      },
      {
        topic: "システムの役割",
        options: [
          "融資の可否まで判断する",
          "判断材料の整理と根拠の提示にとどめる",
        ],
        chosen: "判断材料の整理と根拠の提示にとどめる",
        reason:
          "判断は人が行う前提とし、生成物は人のレビューを経て使う設計にするため",
      },
    ],
    stack: [
      "Python",
      "PostgreSQL",
      "pgvector",
      "Claude Agent SDK",
      "Ollama",
      "MCP",
      "Docker",
      "RAG",
    ],
  },
  {
    slug: "career-copilot",
    title: "career-copilot",
    kind: "personal",
    summary:
      "転職活動を支援するWebアプリ。求人を取り込み、職務経歴とのギャップを分析し、応募先ごとにレジュメを調整する(開発中)",
    period: "2026.08 – 現在",
    repo: "https://github.com/koshio123/career-copilot",
    images: [
      {
        src: "/projects/career-copilot/architecture.png",
        alt: "SPAからAPI、タスクキュー、2種類のワーカー、データストア、外部サービスへつながる構成図",
        caption: "構成図(目標の構成)。短時間の処理はLambda、ブラウザでの取得はFargateに分ける",
        width: 1600,
        height: 920,
      },
    ],
    problems: {
      purpose: [
        "求人ごとに、自分の経験やスキルの何が足りないかを把握するのに手間がかかる",
        "応募先に合わせたレジュメの書き分けと、選考状況の管理が煩雑になる",
      ],
      technical: [
        "サイトごとに形式が異なる求人情報を、利用規約とrobots.txtを守りながら取得する",
        "個人利用で、使っていない時間のクラウド費用を抑える",
        "レジュメという機微な個人情報を安全に扱う",
      ],
    },
    decisions: [
      {
        topic: "APIのホスティング",
        options: ["常時起動のコンテナ", "Lambda + API Gateway"],
        chosen: "Lambda + API Gateway",
        reason:
          "個人利用ではアイドル時の費用がほぼかからないため。負荷が増えたらコンテナへ移す",
      },
      {
        topic: "非同期ワーカー",
        options: ["すべてLambda", "すべてFargate", "ジョブの種類で分ける"],
        chosen: "ジョブの種類で分ける",
        reason:
          "LLMによる構造化や分析は短時間なのでLambda、ブラウザでの取得は長時間になり得るのでFargateにするため",
      },
      {
        topic: "フロントエンド",
        options: ["Next.js(SSR)", "Vite + React のSPA"],
        chosen: "Vite + React のSPA",
        reason:
          "ログイン後の画面が中心でSSRやSEOが不要なため。S3とCloudFrontで配信できる",
      },
    ],
    stack: [
      "Python",
      "FastAPI",
      "SQLAlchemy",
      "PostgreSQL",
      "TypeScript",
      "React",
      "Vite",
      "AWS",
      "Terraform",
      "Playwright",
      "Claude API",
    ],
  },
  {
    slug: "portfolio",
    title: "portfolio",
    kind: "personal",
    summary:
      "ビジョンと経歴を伝えるためのポートフォリオサイト(このサイト)。Homeはスクロールで進む3Dのミニチュア都市",
    period: "2026.10 – 現在",
    repo: "https://github.com/koshio123/portfolio",
    images: [
      {
        src: "/projects/portfolio/home.png",
        alt: "ミニチュア都市の上空にAIの核とデジタルツインが浮かび、街へ光が降りているHomeの3Dシーン",
        caption: "Homeの3Dシーン(03 AI)",
        width: 1898,
        height: 923,
      },
    ],
    problems: {
      purpose: [
        "職務経歴書だけでは伝わりにくいビジョンを、短い時間で伝える",
        "経歴やプロジェクトの内容を、自分で手早く更新できる状態を保つ",
      ],
      technical: [
        "スクロールに連動する3Dシーンを、スマートフォンや低性能の端末でも破綻させない",
        "多数の3Dモデルを軽く読み込む",
      ],
    },
    decisions: [
      {
        topic: "コンテンツの管理",
        options: ["CMS", "リポジトリ内のTypeScriptとMDX"],
        chosen: "リポジトリ内のTypeScriptとMDX",
        reason:
          "外部サービスが不要で、型によって入力の抜けを検出でき、変更履歴もGitで追えるため",
      },
      {
        topic: "3Dが使えない環境への対応",
        options: ["3Dを必須にする", "静止画に切り替える"],
        chosen: "静止画に切り替える",
        reason:
          "動きを減らす設定の利用者や、WebGLが使えない環境でも内容が伝わるようにするため",
      },
    ],
    stack: [
      "TypeScript",
      "Next.js",
      "React",
      "Tailwind CSS",
      "Three.js",
      "React Three Fiber",
      "MDX",
    ],
  },
];

export const kindLabel: Record<ProjectKind, string> = {
  work: "業務",
  personal: "個人開発",
};

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
