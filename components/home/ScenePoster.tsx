/**
 * 3Dシーンの代わりに表示する静止画(動きを減らす設定・WebGL非対応・読み込み中)。
 * 第1幕「ICT」の夜の街を SVG で描いたもの。
 */
export function ScenePoster() {
  const blocks = [
    [16, 118, 62, 132],
    [88, 86, 46, 164],
    [300, 64, 72, 186],
    [382, 104, 52, 146],
    [512, 92, 62, 158],
    [584, 128, 72, 122],
  ];
  const nodes = [
    [47, 118],
    [111, 86],
    [212, 142],
    [336, 64],
    [408, 104],
    [543, 92],
    [620, 128],
  ];
  return (
    <svg
      viewBox="0 0 672 330"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden
    >
      <rect width="672" height="330" fill="#0e1726" />
      <g fill="#16284a">
        {blocks.map(([x, y, w, h]) => (
          <rect key={x} x={x} y={y} width={w} height={h} />
        ))}
      </g>
      <rect y="250" width="672" height="80" fill="#0a1222" />
      <rect y="266" width="672" height="28" fill="#070e1b" />
      <polygon points="146,184 212,142 278,184" fill="#16304f" />
      <rect x="156" y="182" width="112" height="68" fill="#1c3a62" />
      <polyline
        points={nodes.map((n) => n.join(",")).join(" ")}
        fill="none"
        stroke="#3dd6f5"
        strokeWidth="1.2"
        opacity="0.85"
      />
      <g fill="#3dd6f5">
        {nodes.map(([cx, cy]) => (
          <circle key={cx} cx={cx} cy={cy} r="2.5" />
        ))}
      </g>
    </svg>
  );
}
