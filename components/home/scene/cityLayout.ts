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
/** 道路の長さ(車が走る範囲) */
export const ROAD_LENGTH = 40;
/** 道路タイルを中心から何枚ぶん延ばすか */
const ROAD_TILES = 20;
/** 郊外を中心から何区画ぶん広げるか */
const OUTSKIRTS = 12;
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

  // 郊外:中心街の外側に、木とまばらな家・低い建物を置く(街の外が空き地に見えないように)
  const randOut = seededRandom(19);
  for (let ix = -OUTSKIRTS; ix <= OUTSKIRTS; ix++) {
    for (let iz = -OUTSKIRTS; iz <= OUTSKIRTS; iz++) {
      if (Math.max(Math.abs(ix), Math.abs(iz)) <= 5 || ix === 0 || iz === 0) continue;
      const x = ix * STEP + (randOut() - 0.5) * 0.8;
      const z = iz * STEP + (randOut() - 0.5) * 0.8;
      const r = randOut();
      if (r < 0.5) place(randOut() < 0.5 ? "tree-large" : "tree-small", x, z, 2.6, 0);
      else if (r < 0.68) place(HOUSES[Math.floor(randOut() * HOUSES.length)], x, z, 1.3, Math.floor(randOut() * 4) * (Math.PI / 2));
      else if (r < 0.76) place(BUILDINGS[Math.floor(randOut() * 5)], x, z, 1.4, Math.floor(randOut() * 4) * (Math.PI / 2));
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

/** 屋上どうし(と地面)を結ぶネットワークの線分(LineSegments 用) */
export function networkPositions({ rooftops, homes }: CityLayout) {
  const nodes = [...rooftops, ...homes];
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
    out.push(a[0], a[1], a[2], a[0], 0.05, a[2]);
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
