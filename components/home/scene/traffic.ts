import * as THREE from "three";
import { CAR_MODELS, ROAD_TILES, STEP } from "./cityLayout";

/**
 * 車の動き。交差点を中心に、横(x 軸)と縦(z 軸)の道路を2車線ずつ走る。
 *
 * - 混沌(chaos = 1):交差点の手前と先の両側で、各車線 8 台ずつが詰まって止まる
 * - 混沌が解ける(chaos 1 → 0):手前の列は後ろへ、先の列は前へ車間を広げる。
 *   並び順は変えず、交差点もまたがないので、追い越しや重なりは起きない
 * - それ以降:等間隔で流れる。縦の車列は半周期ずらしてあり、信号なしで交互に交差点を抜ける
 *
 * 「進行方向の座標 d」は交差点が 0、手前が負。1車線は長さ LOOP の輪として扱い、端で反対側へ戻す。
 */

/** 交差点の片側に並ぶ台数 */
const QUEUE = 8;
/** 1車線の台数(交差点の手前と先) */
const CARS_PER_LANE = QUEUE * 2;
/** 流れているときの車間 */
const SPACING = 6;
/** 輪の長さ。道路タイルの端(ROAD_TILES * STEP)より少し内側に収まる */
const LOOP = CARS_PER_LANE * SPACING;
/** 渋滞のときの車間 */
const JAM_GAP = 1.2;
/** 渋滞の先頭が止まる位置(交差点の手前) */
const JAM_HEAD = -2;
/** 車線の中心線からのずれ(左側通行) */
const LANE_OFFSET = 0.5;
const SPEED_SLOW = 0.3;
const SPEED_FLOW = 5;

if (LOOP / 2 > ROAD_TILES * STEP) throw new Error("traffic: LOOP が道路より長い");

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

/** 車ごとのモデルと、そのモデルの InstancedMesh 内での番号。モデルは 6 種を使い回す */
export const CARS = (() => {
  const used: Record<string, number> = {};
  return Array.from({ length: CAR_COUNT }, (_, i) => {
    // 同じ車線で同じ車種が続かないよう、車線ごとに 1 つずつずらす
    const model = CAR_MODELS[(i + Math.floor(i / LANES.length)) % CAR_MODELS.length];
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
 * 輪のつなぎ目(道路の遠い端)では大きさを 0 に絞り、出入りが見えないようにする。
 */
export function placeCar(i: number, travel: number, chaos: number, out: { position: THREE.Vector3; heading: number; visible: number }) {
  const car = CARS[i];
  const { dir, side, phase } = car.lane;

  // 流れている間に何台ぶん進んだかを並び順に織り込み、渋滞に戻るときも順番を保つ
  const laps = Math.floor(travel / SPACING);
  const rest = travel - laps * SPACING;
  const slot = mod(car.order - laps, CARS_PER_LANE);
  // j >= 0:交差点の手前の列(0 が先頭)。j < 0:交差点の先の列(-1 が最後尾)
  const j = slot < QUEUE ? slot : slot - CARS_PER_LANE;

  const flowing = JAM_HEAD + rest + phase - j * SPACING;
  const jammed = j >= 0 ? JAM_HEAD - j * JAM_GAP : -JAM_HEAD + (-j - 1) * JAM_GAP;
  const raw = THREE.MathUtils.lerp(flowing, jammed, chaos);
  const d = mod(raw + LOOP / 2, LOOP) - LOOP / 2;

  out.position.copy(dir).multiplyScalar(d).add(side);
  out.heading = Math.atan2(dir.x, dir.z); // モデルの前は +z
  out.visible = THREE.MathUtils.smoothstep(LOOP / 2 - Math.abs(d), 0, 2);
}
