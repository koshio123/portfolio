import * as THREE from "three";
import type { CityModels } from "./useCityModels";

/**
 * ミニチュア都市の配置。乱数は固定シードなので毎回同じ街になる。
 * 道路:x 軸方向の大通り(z = 0)と、z 軸方向の通り(x = 0)。左手前(x < 0, z > 0)は住宅街。
 * モデルの外寸に合わせて拡大率を決めるため、読み込んだモデルを受け取って配置を作る。
 */

export function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 1区画の大きさ(道路タイルもこの大きさ) */
export const STEP = 2.4;
/** 道路タイルを中心から何枚ぶん延ばすか */
export const ROAD_TILES = 20;
/** 車の拡大率 */
export const CAR_SCALE = 0.36;

export const CAR_MODELS = ["car-sedan", "car-suv", "car-taxi", "car-van", "car-hatchback-sports", "car-delivery"];

const BUILDINGS = "abcdefghijklmn".split("").map((c) => `building-${c}`);
const SKYSCRAPERS = "abcde".split("").map((c) => `skyscraper-${c}`);
const HOUSES = "abcdefgh".split("").map((c) => `house-${c}`);

export type CityLayout = {
  /** モデル ID → 置く位置(行列)の一覧。InstancedMesh で描く */
  instances: Record<string, THREE.Matrix4[]>;
  /** 屋上の位置(ネットワークや粒子の起点) */
  rooftops: [number, number, number][];
  /** 住宅の屋根の位置 */
  homes: [number, number, number][];
};

const tmp = new THREE.Object3D();

export function createLayout(models: CityModels): CityLayout {
  const rand = seededRandom(7);
  const instances: Record<string, THREE.Matrix4[]> = {};
  const rooftops: [number, number, number][] = [];
  const homes: [number, number, number][] = [];

  const place = (id: string, x: number, z: number, scale: number, rotY: number) => {
    tmp.position.set(x, 0, z);
    tmp.rotation.set(0, rotY, 0);
    tmp.scale.setScalar(scale);
    tmp.updateMatrix();
    (instances[id] ??= []).push(tmp.matrix.clone());
    return models[id].size.y * scale;
  };
  const pick = (list: string[]) => list[Math.floor(rand() * list.length)];
  const quarterTurn = () => Math.floor(rand() * 4) * (Math.PI / 2);

  for (let ix = -5; ix <= 5; ix++) {
    for (let iz = -5; iz <= 5; iz++) {
      const x = ix * STEP;
      const z = iz * STEP;
      if (Math.abs(x) < 2 || Math.abs(z) < 2) continue; // 道路

      // 住宅街
      if (x < -1 && z > 1) {
        if (ix >= -4 && iz <= 4) {
          const h = place(pick(HOUSES), x, z, 1.3, quarterTurn());
          homes.push([x, h, z]);
        } else {
          place(rand() < 0.5 ? "tree-large" : "tree-small", x, z, 2.6, 0);
        }
        continue;
      }

      if (rand() < 0.1) {
        place("tree-large", x, z, 2.6, 0);
        continue;
      }
      // 中心ほど高層ビル
      const centrality = 1 - Math.min(1, Math.hypot(x, z) / 14);
      const id = centrality > 0.45 && rand() < 0.8 ? pick(SKYSCRAPERS) : pick(BUILDINGS);
      const { x: w, z: d } = models[id].size;
      const scale = Math.min(1.7, 2.1 / Math.max(w, d));
      const h = place(id, x + (rand() - 0.5) * 0.2, z + (rand() - 0.5) * 0.2, scale, quarterTurn());
      rooftops.push([x, h, z]);
    }
  }

  // 道路(フォグに溶けるところまで延ばし、端が見えないようにする)
  for (let k = -ROAD_TILES; k <= ROAD_TILES; k++) {
    if (k === 0) {
      place("road-crossroad", 0, 0, STEP, 0);
      continue;
    }
    place("road-straight", k * STEP, 0, STEP, 0); // x 方向の大通り
    place("road-straight", 0, k * STEP, STEP, Math.PI / 2); // z 方向の通り
  }

  return { instances, rooftops, homes };
}

/** 屋上どうしを結ぶネットワークの線分(LineSegments 用)。各屋上を、近い2つの屋上とつなぐ */
export function networkPositions({ rooftops, homes }: CityLayout) {
  const nodes = [...rooftops, ...homes];
  const out: number[] = [];
  const linked = new Set<string>();
  nodes.forEach((a, i) => {
    const nearest = nodes
      .map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[2] - b[2]) }))
      .filter(({ j, d }) => j !== i && d < 5)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    for (const { j } of nearest) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (linked.has(key)) continue;
      linked.add(key);
      out.push(...a, ...nodes[j]);
    }
  });
  return new Float32Array(out);
}

/** データの粒子が立ち昇る起点(屋上・住宅・道路) */
export function particleOrigins({ rooftops, homes }: CityLayout) {
  return [
    ...rooftops,
    ...homes,
    ...Array.from({ length: 12 }, (_, i) => [-14 + i * 2.5, 0.3, 0] as [number, number, number]),
  ];
}
