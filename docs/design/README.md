# デザイン資料

企画・設計フェーズで作った絵コンテ、ワイヤーフレーム、カンプと、デザインシステム「Portfolio Twin」のソース。
Claude のデザインキャンバスとデザインシステムから書き出したもので、テキストとして編集できる。

- 元のデザインキャンバス: https://claude.ai/artifact/FTFQtkJbofxHHoovhFPfvL
- 元のデザインシステム: https://claude.ai/artifact/NmZc2NFqmMq2nD787HWUai

> ここにあるのは設計時点の記録。その後の実装で変えた点(「ICT」→「IT」、「00 混沌」→「00 PROBLEM」、
> 各幕のキャプション、フォント、ヘッダーのアイコン枠など)は反映していない。食い違う場合は実装が正。

## 構成

```
canvas/            絵コンテ・ワイヤーフレーム・方向性ボード・カンプ(1画面 = 1ファイルの HTML)
  canvas.json      キャンバス上での各画面の位置・大きさ・タイトル
  support.js       ブラウザで単体表示するための小さな補助スクリプト
system/            デザインシステム「Portfolio Twin」
  README.md        考え方と使い方の規則(色・文字・余白・図解・動き・アクセシビリティ)
  tokens.json      デザイントークン(色・文字・余白・角丸)
  tokens.css       tokens.json を CSS 変数にしたもの(preview.html の表示用)
  components/      コンポーネントごとの規則(README.md)と見本(preview.html)
images/            上記すべてを画像にしたもの(GitHub 上でそのまま見られる)
```

## 画面の一覧

| 種類 | ファイル(`canvas/`) | 画像(`images/`) |
|---|---|---|
| 絵コンテ(Home の3Dシーン、第0〜4幕) | `Act0`〜`Act4.dc.html` | `Act0`〜`Act4.png` |
| ワイヤーフレーム | `Main`(Home)、`Projects`、`ProjectDetail`、`Experience`、`Blog`、`About` | 同名の `.png` |
| デザインの方向性(3案。採用は案C) | `DirA`、`DirB`、`DirC` | 同名の `.png` |
| カンプ(案C) | `CompHome`、`CompProjects`、`CompProjectDetail`、`CompExperience`、`CompBlog`、`CompAbout` | 同名の `.png` |
| デザインシステムの見本 | `system/components/*/preview.html` | `system-*.png` |

## 見る・編集する

- **見る**: `images/` の画像を開く。HTML はブラウザで直接開ける(フォントは Google Fonts から読み込む)。
- **編集する**: HTML はインラインスタイルで書かれた普通の HTML なので、エディタで直接書き換えられる。
  `canvas/*.dc.html` は `<x-dc>` の中身が画面の本体。
- **Claude のデザインキャンバスへ戻す**: `canvas/*.dc.html` と `canvas.json` は書き出したときの形式のままなので、
  Claude に渡せばキャンバスとして編集を続けられる(`support.js` は不要)。
- 編集したら `images/` の画像も撮り直す。
