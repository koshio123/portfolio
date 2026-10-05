/**
 * サイト全体の設定。名前・URL・リンクはここだけを書き換える。
 */
export const site = {
  name: "[氏名]", // TODO: 表示名に置き換える
  role: "ソフトウェアエンジニア",
  url: "https://example.com", // TODO: 公開ドメインに置き換える
  description:
    "IT基盤を活用して、AIとビッグデータで生活から無駄を取り除くソフトウェアエンジニアのポートフォリオ。",
  links: {
    github: "https://github.com/your-account", // TODO
    linkedin: "https://www.linkedin.com/in/your-account", // TODO
  },
  resumePdf: "/resume.pdf", // TODO: public/resume.pdf を置く
} as const;

export const navItems = [
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
] as const;
