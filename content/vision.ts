/**
 * ビジョン文と、Home の3Dシーンの各幕に重ねるキャプション。
 * 幕の順番は components/home/scene/keyframes.ts のキーフレームと対応する。
 */
export const vision = {
  statement:
    "IT基盤上でビッグデータ・AIを活用し、人々の生活から無駄を取り除き、人生に有益な時間を最大化できる世界を実現する。",
  /** statement の中でアンバーで強調する部分 */
  highlight: "人生に有益な時間を最大化",
};

export type Act = {
  /** 進行インジケーターの表示 */
  step: string;
  /** キャプション上の小さなラベル(なしの幕はキャプションを出さない) */
  kicker?: string;
  title?: string;
};

export const acts: Act[] = [
  { step: "00 PROBLEM", kicker: "00 — PROBLEM", title: "問題があふれる世界" },
  { step: "01 IT", kicker: "01 — IT", title: "すべてをつなぐ基盤" },
  { step: "02 DATA", kicker: "02 — BIG DATA", title: "世界を映し、理解する" },
  { step: "03 AI", kicker: "03 — AI", title: "難問を解決する" },
  { step: "04 VISION", kicker: "04 — VISION", title: "人々の有益な時間を最大化する" },
];
