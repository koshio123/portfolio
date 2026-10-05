import * as THREE from "three";

/**
 * 幕ごとの見た目(色・光・カメラ)。スクロール量 p(0〜1)で隣り合う幕の間を補間する。
 * 幕 i の中心は p = i / (KEYFRAMES.length - 1)。content/vision.ts の acts と同じ順番。
 */
type Keyframe = {
  sky: string;
  ground: string;
  building: string;
  ambient: number;
  sun: string;
  sunIntensity: number;
  sunPosition: [number, number, number];
  camera: [number, number, number];
  target: [number, number, number];
};

const KEYFRAMES: Keyframe[] = [
  // 00 混沌:灰色にくすんだ夕方。上空の遠景
  { sky: "#3b4048", ground: "#2c3037", building: "#5a606a", ambient: 0.7, sun: "#c9b9a0", sunIntensity: 0.6, sunPosition: [10, 20, 5], camera: [0, 30, 40], target: [0, 0, 0] },
  // 01 ICT:夜。地表すれすれ
  { sky: "#0e1726", ground: "#0b1628", building: "#2a4a7a", ambient: 0.5, sun: "#6f8fd6", sunIntensity: 0.6, sunPosition: [-10, 20, 10], camera: [-8, 6, -22], target: [0, 3, 0] },
  // 02 ビッグデータ:上空のツインを見上げる
  { sky: "#0a1630", ground: "#08132a", building: "#172c4d", ambient: 0.4, sun: "#6f8fd6", sunIntensity: 0.5, sunPosition: [0, 25, 10], camera: [0, 14, 28], target: [0, 8, 0] },
  // 03 AI:夜明けの街を巡る
  { sky: "#143058", ground: "#102340", building: "#2a4f86", ambient: 0.7, sun: "#bcd4ff", sunIntensity: 0.9, sunPosition: [10, 25, 10], camera: [20, 12, 17], target: [-2, 0, 2] },
  // 04 ビジョン:夕日。引きの俯瞰
  { sky: "#e9915a", ground: "#6e8f5e", building: "#9a5f4f", ambient: 0.9, sun: "#ffd3a0", sunIntensity: 1.5, sunPosition: [-25, 8, -10], camera: [0, 24, 44], target: [0, 2, 0] },
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** 各演出の強さ(0〜1)。どの幕で何が現れるかはここで決める */
export function phases(p: number) {
  return {
    chaos: 1 - smoothstep(0.05, 0.25, p),
    network: smoothstep(0.12, 0.3, p),
    data: smoothstep(0.37, 0.5, p) * (1 - smoothstep(0.62, 0.75, p)),
    twin: smoothstep(0.4, 0.55, p) * (1 - 0.7 * smoothstep(0.85, 1, p)),
    optimize: smoothstep(0.62, 0.78, p),
    sunset: smoothstep(0.82, 1, p),
  };
}

const frames = KEYFRAMES.map((k) => ({
  ...k,
  sky: new THREE.Color(k.sky),
  ground: new THREE.Color(k.ground),
  building: new THREE.Color(k.building),
  sun: new THREE.Color(k.sun),
  sunPosition: new THREE.Vector3(...k.sunPosition),
  camera: new THREE.Vector3(...k.camera),
  target: new THREE.Vector3(...k.target),
}));

/** 毎フレームの補間結果(使い回してメモリ確保を避ける) */
const sample = {
  sky: new THREE.Color(),
  ground: new THREE.Color(),
  building: new THREE.Color(),
  sun: new THREE.Color(),
  sunPosition: new THREE.Vector3(),
  camera: new THREE.Vector3(),
  target: new THREE.Vector3(),
  ambient: 0,
  sunIntensity: 0,
};

export function sampleKeyframes(p: number) {
  const f = clamp01(p) * (frames.length - 1);
  const i = Math.min(Math.floor(f), frames.length - 2);
  const t = smoothstep(0, 1, f - i);
  const a = frames[i];
  const b = frames[i + 1];
  sample.sky.lerpColors(a.sky, b.sky, t);
  sample.ground.lerpColors(a.ground, b.ground, t);
  sample.building.lerpColors(a.building, b.building, t);
  sample.sun.lerpColors(a.sun, b.sun, t);
  sample.sunPosition.lerpVectors(a.sunPosition, b.sunPosition, t);
  sample.camera.lerpVectors(a.camera, b.camera, t);
  sample.target.lerpVectors(a.target, b.target, t);
  sample.ambient = THREE.MathUtils.lerp(a.ambient, b.ambient, t);
  sample.sunIntensity = THREE.MathUtils.lerp(a.sunIntensity, b.sunIntensity, t);
  return sample;
}
