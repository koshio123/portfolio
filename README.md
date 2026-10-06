# Portfolio

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r186-000000?logo=threedotjs&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

ポートフォリオサイト。Next.js(App Router)+ TypeScript + Tailwind CSS。
Home はビジョンを表す3Dのミニチュア都市(React Three Fiber)で、スクロールに合わせて5幕が進みます。

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
npm run assets   # 3Dモデル(public/models/city.glb)を作り直す
```

## 技術スタック

| 分類 | 技術 | 用途 |
|---|---|---|
| フレームワーク | [Next.js](https://nextjs.org) 16(App Router) / [React](https://react.dev) 19 | ルーティング・レンダリング・メタデータ(OGP、サイトマップ) |
| 言語 | [TypeScript](https://www.typescriptlang.org) 5 | アプリ全体の型付け |
| スタイリング | [Tailwind CSS](https://tailwindcss.com) 4 | デザイントークン(Portfolio Twin)ベースのスタイル |
| 3D | [three.js](https://threejs.org) / [React Three Fiber](https://r3f.docs.pmnd.rs) / [postprocessing](https://github.com/pmndrs/postprocessing) | Home のミニチュア都市とブルーム表現 |
| コンテンツ | [MDX](https://mdxjs.com)(`@next/mdx`) | ブログ記事 |
| 3Dアセット | [glTF-Transform](https://gltf-transform.dev) / [meshoptimizer](https://github.com/zeux/meshoptimizer) / [Kenney](https://kenney.nl)(CC0) | モデルの結合と圧縮(`npm run assets`) |
| 品質管理 | [ESLint](https://eslint.org) | 静的解析(`npm run lint`) |
| ホスティング | [Vercel](https://vercel.com) | デプロイ |

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
  projects/               ProjectCard、ProjectsBrowser(絞り込み)
  blog/                   PostCard
  home/                   VisionScene(スクロール制御・キャプション)、ScenePoster(静止画)
    scene/                CityCanvas(描画設定)、City(3Dの中身)、keyframes(幕ごとの色・カメラ)、
                          cityLayout(街の配置)、traffic(車の動き)、NetworkLines(01 の光の線)、
                          AiCore(03 のAIの核・指令・検出枠)、useCityModels(モデル読み込み)、Sky、Helpers(ドローン等)
content/                  ★ 文章やデータはすべてここ
  site.ts                 名前・URL・SNSリンク・ナビ
  vision.ts               ビジョン文と、3Dシーンの幕ごとのキャプション
  projects.ts             プロジェクト(詳細ページはここから自動生成)
  experience.ts           職務経歴・スキル・資格
  blog/*.mdx              ブログ記事
lib/blog.ts               記事一覧の読み込み
scripts/build-city-assets.mjs  Kenney素材から city.glb を作るスクリプト
public/models/city.glb    3Dシーンのモデル(スクリプトの出力)
mdx-components.tsx        ブログ本文のスタイル
docs/design/              設計時の絵コンテ・ワイヤーフレーム・カンプとデザインシステムのソース
```

## 内容の更新

| 変更箇所 | 編集ファイル |
|---|---|
| 名前・URL・GitHub/LinkedIn | `content/site.ts` |
| プロジェクトの追加・修正 | `content/projects.ts`(配列に1件追加すると一覧と詳細ページができる) |
| 経歴・スキル | `content/experience.ts`(スキルの `level` に 1〜5 を入れるとメーターが塗られる) |
| ブログ記事 | `content/blog/<slug>.mdx` を追加(先頭に `export const metadata = { title, date, summary, tags }`) |
| 職務経歴書 PDF | `public/resume.pdf` を置き、`content/site.ts` の `resumePdf` に `"/resume.pdf"` を書く(ダウンロードボタンが出る) |
| プロジェクトの画像 | `public/` に置き、`projects.ts` の `image`(`src` `alt` `width` `height`)に書く(詳細ページの「イメージ図」に表示) |

`[ ]` で囲まれた文字列はプレースホルダーです。

## デザイン

- トークンはデザインシステム「Portfolio Twin」と同じ値を `app/globals.css` に定義しています。
- 絵コンテ・ワイヤーフレーム・カンプとデザインシステムのソースは [`docs/design/`](docs/design/README.md) にあります。
- 色は意味の名前で使います(`bg-bg` `text-ink` `text-ink-muted` `border-line` `bg-surface` `text-link` など)。
- **Twin**:コンテンツは Day(白)、Home の3D・ヘッダー・フッターは Night。要素に `data-theme="night"` を付けると、その中のトークンが夜の値に切り替わります。

## 3Dシーン

- `VisionScene` がセクションを「幕の数 × 画面の高さ」に伸ばし、表示領域を固定(sticky)して、スクロール量 0〜1 を `City` に渡します。
- 見た目の調整は `components/home/scene/keyframes.ts` だけで完結します。
  - `KEYFRAMES`:幕ごとの空・地面・建物の色、光、カメラ位置
  - `phases()`:混沌・ネットワーク・データ粒子・ツイン・最適化・夕日が、スクロールのどこで現れるか
- three.js は Home を開いたときだけブラウザで読み込みます(`next/dynamic` の `ssr: false`)。
- 読み込み中は夜色の背景とローディング表示だけを出し、最初のフレームを描いてから3Dをフェードインします。
- 動きを減らす設定(prefers-reduced-motion)や WebGL 非対応の環境では、`ScenePoster` の静止画(`public/scene-poster.jpg`、実際の3Dシーンを撮影した画像)になります。
- 画面外にスクロールすると描画を止めます。

### 3Dモデル

- モデルは [Kenney](https://kenney.nl) の CC0 素材(City Kit Commercial / Suburban / Roads、Car Kit、Furniture Kit)です。
- `npm run assets` で、スクリプトが Kenney から zip を取得し(`.cache/` に保存)、使うモデルだけを1つの GLB にまとめて meshopt 圧縮します。
- 使うモデルを増やすときは、スクリプトの `MODELS` にモデル ID とファイル名を足して再実行します。
- 読み込み側(`useCityModels`)は、モデルごとにメッシュを1つにまとめ、同じモデルは `InstancedMesh` でまとめて描きます。
- 街全体の色は幕ごとの `tint` を掛けて統一しています(素材の配色はそのまま、夜は青く、混沌はくすませる)。
- 影とブルーム(発光)は、画面幅 768px 以上かつ CPU 4 コア以上のときだけ有効です。

## デプロイ

Vercel にリポジトリをインポートするだけで動きます。公開前に `content/site.ts` の `url` を本番ドメインにしてください(OGP・サイトマップに使われます)。

## プロジェクトの画像を追加する

1. 画像を `public/projects/<slug>/` に置く(例: `public/projects/v2x-smart-charging/architecture.png`)。
2. `content/projects.ts` の該当プロジェクトに `images` を書く。1枚目が一覧のカードにも出る。

```ts
images: [
  { src: "/projects/v2x-smart-charging/architecture.png", alt: "構成の説明", caption: "全体構成", width: 1600, height: 900 },
],
```
