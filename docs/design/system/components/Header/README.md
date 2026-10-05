# Header

全ページ共通のヘッダー。常に Night ゾーン(`data-theme="night"`)で、3Dシーンとコンテンツページをつなぐ帯になる。

- 左に氏名(`label` に近い等幅、18px)、右にナビゲーション:Projects / Experience / Blog / About。
- ナビの一番右に GitHub・LinkedIn のアイコンボタン(44×44、`--line-strong` の枠、`radius-md`)。公式マークを使い `aria-label` を付ける。
- 現在のページは `--link`(シアン)の文字色にし、`aria-current="page"` を付ける。
- モバイルではナビが折り返す。ハンバーガーメニューは使わない(項目が4つのため)。
- 利用側が用意するもの:現在のページ、GitHub・LinkedIn の URL。
