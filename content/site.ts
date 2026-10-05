/**
 * サイト全体の設定。名前・URL・リンクはここだけを書き換える。
 */
export const site = {
  name: "Kentaro Koshio",
  role: "Software Engineer / System Engineer",
  url: "https://example.com", // TODO: 公開ドメインに置き換える
  description:
    "IT基盤を活用して、AIとビッグデータで生活から無駄を取り除くソフトウェアエンジニアのポートフォリオ。",
  links: {
    github: "https://github.com/koshio123",
    linkedin: "https://www.linkedin.com/in/kentaro-koshio-7ab335153/",
  },
  /** 職務経歴書 PDF のパス。public/ に置いて "/resume.pdf" のように書くと、ダウンロードボタンが出る */
  resumePdf: null as string | null,
} as const;

export const navItems = [
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
] as const;
