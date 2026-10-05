"use client";

import { useEffect, useImperativeHandle, useMemo, type Ref } from "react";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

/**
 * 03 AI:上空のツインの中心で脈動する「AIの核」と、そこから街へ届く指令。
 *
 * - 核から対象(車・ドローン・ロボット・住宅)へ光の筋が伸び、光の粒が降りていく
 * - 対象には検出枠(四隅のかぎ括弧)が付き、対象を追いかける。
 *   枠は赤(問題)で現れ、AIが効いてくるにつれて緑(解決)に変わる。粒が届くたびに明るく光る
 *
 * 対象の位置は City が毎フレーム setTarget で渡す。
 */
export type AiHandle = {
  /** i 番目の対象の位置と、検出枠の大きさ(中心から辺まで)。size が 0 なら表示しない */
  setTarget: (i: number, position: THREE.Vector3, size: number) => void;
  /**
   * @param strength 0〜1。全体の表示の強さ
   * @param solved 0〜1。進むほど、赤い枠が順に緑へ変わる
   * @param time 経過秒
   */
  update: (camera: THREE.Camera, strength: number, solved: number, time: number) => void;
};

/** 検出枠1つあたりの線分(四隅 × 2) */
const FRAME_SEGMENTS = 8;
/** 検出枠の一辺に対する、かぎ括弧の長さの割合 */
const CORNER = 0.6;
/** 光の粒が核から対象まで降りるのにかかる秒数 */
const PULSE_SECONDS = 2.2;

const BEAM = new THREE.Color("#3dd6f5");
const PROBLEM = new THREE.Color("#ff4a3d");
const SOLVED = new THREE.Color("#2fe08a");
const PULSE = new THREE.Color("#c8f4ff").multiplyScalar(2.5);
const CORE_WHITE = new THREE.Color("#ffffff").multiplyScalar(3);
const CORE_CYAN = new THREE.Color("#3dd6f5").multiplyScalar(2.2);

const overlayMaterial = { transparent: true, depthWrite: false, toneMapped: false } as const;

/** 毎フレーム書き換える太線。頂点色で線分ごとに色と明るさを変える */
function createLines(segments: number, linewidth: number, blending: THREE.Blending) {
  const positions = new Float32Array(segments * 6);
  const colors = new Float32Array(segments * 6);
  const geometry = new LineSegmentsGeometry().setPositions(positions).setColors(colors);
  const material = new LineMaterial({
    ...overlayMaterial,
    vertexColors: true,
    linewidth, // 画面上の太さ(px)
    opacity: 0,
    blending,
    depthTest: false, // 建物の向こうの対象も「見えている」ように描く
  });
  const object = new LineSegments2(geometry, material);
  object.frustumCulled = false;
  object.renderOrder = 11;
  let cursor = 0;

  return {
    object,
    material,
    /** 書き込み位置を先頭へ戻す */
    begin() {
      cursor = 0;
    },
    /** 線分を1本書き込む。明るさは両端で別々に指定できる(0 なら見えない) */
    add(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Color, dimA: number, dimB = dimA) {
      a.toArray(positions, cursor);
      b.toArray(positions, cursor + 3);
      colors.set([c.r * dimA, c.g * dimA, c.b * dimA, c.r * dimB, c.g * dimB, c.b * dimB], cursor);
      cursor += 6;
    },
    /** 書き込んだ内容を GPU へ送る */
    commit() {
      for (const name of ["instanceStart", "instanceColorStart"]) {
        (geometry.getAttribute(name) as THREE.InterleavedBufferAttribute).data.needsUpdate = true;
      }
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

function createCore() {
  const group = new THREE.Group();
  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 24, 16),
    new THREE.MeshBasicMaterial({ ...overlayMaterial, color: CORE_WHITE }),
  );
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.85, 1),
    new THREE.MeshBasicMaterial({ ...overlayMaterial, color: CORE_CYAN, wireframe: true }),
  );
  const ringGeometry = new THREE.TorusGeometry(1.3, 0.018, 8, 72);
  const ringMaterial = new THREE.MeshBasicMaterial({ ...overlayMaterial, color: CORE_CYAN });
  const rings = [new THREE.Mesh(ringGeometry, ringMaterial), new THREE.Mesh(ringGeometry, ringMaterial)];
  group.add(nucleus, shell, ...rings);

  return {
    group,
    animate(time: number, strength: number) {
      group.scale.setScalar(1.5 * strength * (1 + 0.08 * Math.sin(time * 3)));
      shell.rotation.set(time * 0.25, time * 0.4, 0);
      rings[0].rotation.set(Math.PI / 2 + 0.5, time * 0.7, 0);
      rings[1].rotation.set(Math.PI / 2 - 0.6, -time * 0.5, 1);
    },
    dispose() {
      for (const mesh of [nucleus, shell, rings[0]]) {
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
    },
  };
}

function createOverlay(count: number, origin: THREE.Vector3): AiHandle & { object: THREE.Group; dispose: () => void } {
  const object = new THREE.Group();
  const targets = new Float32Array(count * 4); // x, y, z, size

  const core = createCore();
  core.group.position.copy(origin);

  // 光の筋は加算合成で淡く、検出枠は色がはっきり出るよう通常の合成で描く
  const beams = createLines(count, 1.6, THREE.AdditiveBlending);
  const frames = createLines(count * FRAME_SEGMENTS, 2, THREE.NormalBlending);

  // 核から対象へ降りる光の粒
  const pulsePositions = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  const pulseColors = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  const pulseGeometry = new THREE.BufferGeometry();
  pulseGeometry.setAttribute("position", pulsePositions);
  pulseGeometry.setAttribute("color", pulseColors);
  const pulseMaterial = new THREE.PointsMaterial({
    ...overlayMaterial,
    vertexColors: true,
    size: 0.3,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthTest: false,
  });
  const pulses = new THREE.Points(pulseGeometry, pulseMaterial);
  pulses.frustumCulled = false;
  pulses.renderOrder = 12;

  object.add(core.group, beams.object, frames.object, pulses);

  const center = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const corner = new THREE.Vector3();
  const end = new THREE.Vector3();
  const color = new THREE.Color();

  return {
    object,
    setTarget(i, position, size) {
      targets.set([position.x, position.y, position.z, size], i * 4);
    },
    update(camera, strength, solved, time) {
      object.visible = strength > 0.01;
      if (!object.visible) return;

      core.animate(time, strength);
      beams.material.opacity = strength;
      frames.material.opacity = strength;
      pulseMaterial.opacity = strength;

      // 検出枠は常にカメラの正面を向ける
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      up.setFromMatrixColumn(camera.matrixWorld, 1);

      beams.begin();
      frames.begin();
      for (let i = 0; i < count; i++) {
        const size = targets[i * 4 + 3];
        if (size <= 0) {
          beams.add(origin, origin, BEAM, 0);
          for (let k = 0; k < FRAME_SEGMENTS; k++) frames.add(origin, origin, BEAM, 0);
          pulseColors.setXYZ(i, 0, 0, 0);
          continue;
        }
        center.fromArray(targets, i * 4);

        // 光の粒:対象ごとに時間をずらして核から降りる。届いた直後に枠が光る
        const f = (time / PULSE_SECONDS + i * 0.37) % 1;
        const flash = (1 - f) ** 3;
        end.lerpVectors(origin, center, f);
        pulsePositions.setXYZ(i, end.x, end.y, end.z);
        const fade = Math.sin(Math.PI * f) ** 0.5;
        pulseColors.setXYZ(i, PULSE.r * fade, PULSE.g * fade, PULSE.b * fade);

        // 光の筋:核の側が明るく、対象へ向けて淡くなる
        beams.add(origin, center, BEAM, 0.45, 0.12);

        // 検出枠:対象ごとに少しずつ遅れて、赤から緑へ
        const turn = 0.4 + 0.35 * ((i * 0.618) % 1);
        color.lerpColors(PROBLEM, SOLVED, THREE.MathUtils.smoothstep(solved, turn, turn + 0.15));
        const glow = 0.85 + 1.2 * flash;
        for (const sx of [-1, 1]) {
          for (const sy of [-1, 1]) {
            corner.copy(center).addScaledVector(right, sx * size).addScaledVector(up, sy * size);
            frames.add(corner, end.copy(corner).addScaledVector(right, -sx * size * CORNER), color, glow);
            frames.add(corner, end.copy(corner).addScaledVector(up, -sy * size * CORNER), color, glow);
          }
        }
      }
      beams.commit();
      frames.commit();
      pulsePositions.needsUpdate = true;
      pulseColors.needsUpdate = true;
    },
    dispose() {
      core.dispose();
      beams.dispose();
      frames.dispose();
      pulseGeometry.dispose();
      pulseMaterial.dispose();
    },
  };
}

type Props = {
  /** 対象の数 */
  count: number;
  /** 核の位置 */
  position: [number, number, number];
  ref: Ref<AiHandle>;
};

export function AiCore({ count, position: [x, y, z], ref }: Props) {
  const overlay = useMemo(() => createOverlay(count, new THREE.Vector3(x, y, z)), [count, x, y, z]);
  useEffect(() => () => overlay.dispose(), [overlay]);
  useImperativeHandle(ref, () => overlay, [overlay]);
  return <primitive object={overlay.object} />;
}
