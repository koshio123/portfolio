# Portfolio

ソフトウェアエンジニアのポートフォリオサイト。Next.js(App Router)+ TypeScript + Tailwind CSS。
Home はビジョンを表す3Dのミニチュア都市(React Three Fiber)で、スクロールに合わせて5幕が進みます。

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## ディレクトリ構成

```
app/                      ページ(ルーティング)
  page.tsx                Home(3Dシーン → ビジョン → 各ページへの入口)
  projects/               一覧と詳細([slug])
  experience/ blog/ about/
  globals.css             デザイントークン(Portfolio Twin)と Tailwind テーマ
  sitemap.ts robots.ts
components/
  layout/                 Header(Night・固定)、Footer、ナビ
  ui/                     ButtonLink、SectionHeading、Tag、アイコン
  projects/               ProjectCard、ProjectsBrowser(絞り込み)、ArchitectureDiagram
  blog/                   PostCard
  home/                   VisionScene(スクロール制御・キャプション)、ScenePoster(静止画)
    scene/                CityCanvas、City(3Dの中身)、keyframes(幕ごとの色・カメラ)、cityLayout(街の配置)
content/                  ★ 文章やデータはすべてここ
  site.ts                 名前・URL・SNSリンク・ナビ
  vision.ts               ビジョン文と、3Dシーンの幕ごとのキャプション
  projects.ts             プロジェクト(詳細ページはここから自動生成)
  experience.ts           職務経歴・スキル・資格
  blog/*.mdx              ブログ記事
lib/blog.ts               記事一覧の読み込み
mdx-components.tsx        ブログ本文のスタイル
```

## 内容を更新する

| やりたいこと | 編集するファイル |
|---|---|
| 名前・URL・GitHub/LinkedIn | `content/site.ts` |
| プロジェクトの追加・修正 | `content/projects.ts`(配列に1件追加すると一覧と詳細ページができる) |
| 経歴・スキル | `content/experience.ts`(スキルの `level` に 1〜5 を入れるとメーターが塗られる) |
| ブログ記事 | `content/blog/<slug>.mdx` を追加(先頭に `export const metadata = { title, date, summary, tags }`) |
| 職務経歴書 PDF | `public/resume.pdf` を置く |
| プロジェクトの画面画像 | `public/` に置き、`projects.ts` の `screenshot` にパスを書く(全体図の代わりに表示) |

`[ ]` で囲まれた文字列はプレースホルダーです。

## デザイン

- トークンはデザインシステム「Portfolio Twin」と同じ値を `app/globals.css` に定義しています。
- 色は意味の名前で使います(`bg-bg` `text-ink` `text-ink-muted` `border-line` `bg-surface` `text-link` など)。
- **Twin**:コンテンツは Day(白)、Home の3D・ヘッダー・フッターは Night。要素に `data-theme="night"` を付けると、その中のトークンが夜の値に切り替わります。

## 3Dシーン

- `VisionScene` がセクションを「幕の数 × 画面の高さ」に伸ばし、表示領域を固定(sticky)して、スクロール量 0〜1 を `City` に渡します。
- 見た目の調整は `components/home/scene/keyframes.ts` だけで完結します。
  - `KEYFRAMES`:幕ごとの空・地面・建物の色、光、カメラ位置
  - `phases()`:ネットワーク・データ粒子・ツイン・最適化・夕日が、スクロールのどこで現れるか
- three.js は Home を開いたときだけブラウザで読み込みます(`next/dynamic` の `ssr: false`)。
- 動きを減らす設定(prefers-reduced-motion)や WebGL 非対応の環境では、`ScenePoster` の静止画になります。
- 画面外にスクロールすると描画を止めます。

## デプロイ

Vercel にリポジトリをインポートするだけで動きます。公開前に `content/site.ts` の `url` を本番ドメインにしてください(OGP・サイトマップに使われます)。
