"use client";

import { useEffect, useImperativeHandle, useMemo, type Ref } from "react";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

export type NetworkHandle = {
  /**
   * @param reveal 0〜1。線を端から順に何割まで表示するか
   * @param strength 0〜1。全体の明るさ
   * @param time 経過秒。ゆっくり明滅させる
   */
  update: (reveal: number, strength: number, time: number) => void;
};

const CYAN = new THREE.Color("#3dd6f5");

function makeLayer(geometry: LineSegmentsGeometry, linewidth: number) {
  const material = new LineMaterial({
    color: CYAN,
    linewidth, // 画面上の太さ(px)
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    // 建物の向こう側でも途切れないよう、奥行きの判定をしない
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const line = new LineSegments2(geometry, material);
  line.frustumCulled = false;
  line.renderOrder = 10;
  return { line, material };
}

/**
 * 01 IT:街をつなぐ光のネットワーク。
 * 細い芯と、太く淡い光の2層を加算合成で重ね、半透明でぼんやり光る線にする。
 */
export function NetworkLines({ positions, ref }: { positions: Float32Array; ref: Ref<NetworkHandle> }) {
  const { geometry, core, halo, segments } = useMemo(() => {
    const geometry = new LineSegmentsGeometry().setPositions(positions);
    return {
      geometry,
      core: makeLayer(geometry, 1.5),
      halo: makeLayer(geometry, 7),
      segments: positions.length / 6,
    };
  }, [positions]);

  useEffect(
    () => () => {
      geometry.dispose();
      core.material.dispose();
      halo.material.dispose();
    },
    [geometry, core, halo],
  );

  useImperativeHandle(
    ref,
    () => ({
      update(reveal, strength, time) {
        geometry.instanceCount = Math.floor(segments * reveal);
        const pulse = 0.8 + 0.2 * Math.sin(time * 1.6);
        core.material.opacity = 0.55 * strength * pulse;
        halo.material.opacity = 0.16 * strength * pulse;
      },
    }),
    [geometry, core, halo, segments],
  );

  return (
    <>
      <primitive object={halo.line} />
      <primitive object={core.line} />
    </>
  );
}
