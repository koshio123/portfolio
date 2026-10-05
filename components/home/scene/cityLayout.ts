/**
 * ミニチュア都市の配置。乱数は固定シードなので毎回同じ街になる。
 * 道路:x 軸方向の大通り(z = 0)と、z 軸方向の通り(x = 0)。
 * 左手前(x < 0, z > 0)は住宅街。
 */

function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Block = { x: number; z: number; w: number; d: number; h: number };

const rand = seededRandom(7);
const STEP = 2.4;
export const ROAD_LENGTH = 30;

const isResidential = (x: number, z: number) => x < -1 && z > 1;

export const buildings: Block[] = [];
export const houses: Block[] = [];
export const trees: { x: number; z: number; s: number }[] = [];

for (let ix = -5; ix <= 5; ix++) {
  for (let iz = -5; iz <= 5; iz++) {
    const x = ix * STEP;
    const z = iz * STEP;
    if (Math.abs(x) < 2 || Math.abs(z) < 2) continue; // 道路

    if (isResidential(x, z)) {
      if (ix >= -4 && iz <= 4) houses.push({ x, z, w: 1.3, d: 1.1, h: 0.8 });
      else trees.push({ x, z, s: 0.8 + rand() * 0.5 });
      continue;
    }
    if (rand() < 0.12) continue;
    const centrality = 1 - Math.min(1, Math.hypot(x, z) / 14);
    buildings.push({
      x: x + (rand() - 0.5) * 0.3,
      z: z + (rand() - 0.5) * 0.3,
      w: 1.2 + rand() * 0.6,
      d: 1.2 + rand() * 0.6,
      h: 0.8 + rand() * 2 + centrality * 6,
    });
  }
}

/** 建物・家の屋上を、近いものどうしで結んだネットワーク(LineSegments 用の座標列) */
export const networkPositions = (() => {
  const nodes = [...buildings, ...houses].map((b) => [b.x, b.h + 0.05, b.z] as const);
  const out: number[] = [];
  nodes.forEach((a, i) => {
    let best = -1;
    let bestDist = Infinity;
    nodes.forEach((b, j) => {
      if (j <= i) return;
      const d = Math.hypot(a[0] - b[0], a[2] - b[2]);
      if (d < bestDist) {
        bestDist = d;
        best = j;
      }
    });
    if (best >= 0 && bestDist < 4) out.push(...a, ...nodes[best]);
    // 地面の配線へ降ろす線
    out.push(a[0], a[1], a[2], a[0], 0.02, a[2]);
  });
  return new Float32Array(out);
})();

/** データの粒子が立ち昇る起点(屋上と道路) */
export const particleOrigins = [
  ...buildings.map((b) => [b.x, b.h, b.z] as const),
  ...houses.map((b) => [b.x, b.h + 0.5, b.z] as const),
  ...Array.from({ length: 12 }, (_, i) => [-ROAD_LENGTH / 2 + i * 2.5, 0.3, 0] as const),
];

export { seededRandom };
