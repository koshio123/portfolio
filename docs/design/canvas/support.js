/**
 * .dc.html(Claude のデザインキャンバス用ファイル)をブラウザで単体表示するための最小限の代替。
 * キャンバス本来のランタイムの代わりに、{{名前}} を data-props の既定値へ置き換えるだけを行う。
 */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("x-dc");
  const props = JSON.parse(document.querySelector("script[data-dc-script]")?.dataset.props ?? "{}");
  if (!root) return;
  root.innerHTML = root.innerHTML.replace(/\{\{(\w+)\}\}/g, (match, name) => props[name]?.default ?? match);
});
