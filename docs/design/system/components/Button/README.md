# Button

主ボタンと副ボタンの2種類。1つの画面で主ボタンは1つまで。

- 主ボタン:`--primary-bg` の塗りに `--primary-ink`。Day では墨、Night ではシアンになる。
- 副ボタン:透明な地に `--line-strong` の枠、`--ink` の文字。
- 高さは `touch-target`(44px)以上、左右余白 `space-6`、`radius-md`、`small` スタイルの太字。
- ページ内リンクや遷移は `<a>`、操作は `<button>` で書く。見た目は同じ。
- フォーカスは `--focus` の 2px リング。
- 利用側が用意するもの:ラベル、遷移先または処理。
