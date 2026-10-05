import * as THREE from "three";
import { CAR_MODELS, ROAD_LENGTH } from "./cityLayout";

/**
 * 車の動き。交差点を中心に、横(x 軸)と縦(z 軸)の道路を2車線ずつ走る。
 *
 * - 混沌(chaos = 1):4方向とも交差点の手前で詰まって止まる
 * - 混沌が解ける(chaos 1 → 0):先頭はそのまま、後続が車間を広げる。並び順は変えないので追い越さない
 * - それ以降:等間隔で流れる。縦の車列は半周期ずらしてあり、信号なしで交互に交差点を抜ける
 *
 * 「進行方向の座標 d」は交差点が 0、手前が負。道路は長さ ROAD_LENGTH の輪として扱い、端で反対側へ戻す。
 */

const CARS_PER_LANE = 4;
/** 流れているときの車間 */
const SPACING = ROAD_LENGTH / CARS_PER_LANE;
/** 渋滞のときの車間 */
const JAM_GAP = 1.2;
/** 渋滞の先頭が止まる位置(交差点の手前) */
const JAM_HEAD = -2;
/** 車線の中心線からのずれ(左側通行) */
const LANE_OFFSET = 0.5;
const SPEED_SLOW = 0.3;
const SPEED_FLOW = 5;

type Lane = {
  /** 進行方向 */
  dir: THREE.Vector3;
  /** 車線の位置(進行方向と直交する向きのずれ) */
  side: THREE.Vector3;
  /** 流れているときの位相のずれ(縦の道路は半周期) */
  phase: number;
};

const lane = (dx: number, dz: number, phase: number): Lane => {
  const dir = new THREE.Vector3(dx, 0, dz);
  // 左側通行:進行方向の左へ寄せる
  const side = new THREE.Vector3(dz, 0, -dx).multiplyScalar(LANE_OFFSET);
  return { dir, side, phase };
};

const LANES: Lane[] = [
  lane(1, 0, 0),
  lane(-1, 0, 0),
  lane(0, 1, SPACING / 2),
  lane(0, -1, SPACING / 2),
];

export const CAR_COUNT = LANES.length * CARS_PER_LANE;

/** 車ごとのモデルと、そのモデルの InstancedMesh 内での番号 */
export const CARS = (() => {
  const used: Record<string, number> = {};
  return Array.from({ length: CAR_COUNT }, (_, i) => {
    const model = CAR_MODELS[i % CAR_MODELS.length];
    const index = used[model] ?? 0;
    used[model] = index + 1;
    return { model, index, lane: LANES[i % LANES.length], order: Math.floor(i / LANES.length) };
  });
})();

export const carCountByModel = (model: string) => CARS.filter((c) => c.model === model).length;

const mod = (a: number, n: number) => ((a % n) + n) % n;

/** 走った距離を進める。混沌が解けきるまでは進めない(車間を広げる動きだけにする) */
export function advanceTravel(travel: number, delta: number, chaos: number, optimize: number) {
  if (chaos > 0) return travel;
  return travel + delta * THREE.MathUtils.lerp(SPEED_SLOW, SPEED_FLOW, optimize);
}

/**
 * i 番目の車の位置・向き・表示の大きさ(0〜1)を out に書き込む。
 * 道路の端(輪のつなぎ目)では大きさを 0 に絞り、出入りが見えないようにする。
 */
export function placeCar(i: number, travel: number, chaos: number, out: { position: THREE.Vector3; heading: number; visible: number }) {
  const car = CARS[i];
  const { dir, side, phase } = car.lane;

  // 流れている間に何台ぶん進んだかを並び順に織り込み、渋滞に戻るときも順番を保つ
  const laps = Math.floor(travel / SPACING);
  const rest = travel - laps * SPACING;
  const slot = mod(car.order - laps, CARS_PER_LANE);

  const flow = 1 - chaos;
  const gap = THREE.MathUtils.lerp(SPACING, JAM_GAP, chaos);
  const raw = JAM_HEAD + (rest + phase) * flow - slot * gap;
  const d = mod(raw + ROAD_LENGTH / 2, ROAD_LENGTH) - ROAD_LENGTH / 2;

  out.position.copy(dir).multiplyScalar(d).add(side);
  out.heading = Math.atan2(dir.x, dir.z); // モデルの前は +z
  out.visible = THREE.MathUtils.smoothstep(ROAD_LENGTH / 2 - Math.abs(d), 0, 1.5);
}
