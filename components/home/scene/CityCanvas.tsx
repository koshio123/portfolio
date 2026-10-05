"use client";

import { Suspense, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { City } from "./City";

type Props = {
  /** スクロール量(0〜1)。毎フレーム読むので state ではなく ref で受け取る */
  progress: RefObject<number>;
  /** 画面外では描画を止める */
  active: boolean;
  /** モデルを読み込み、最初のフレームを描いたときに1度だけ呼ばれる */
  onReady: () => void;
};

/** 画面幅とCPUコア数から、影と発光を使うかを決める */
function detectHighQuality() {
  return window.innerWidth >= 768 && (navigator.hardwareConcurrency ?? 4) >= 4;
}

export default function CityCanvas({ progress, active, onReady }: Props) {
  const [high] = useState(detectHighQuality);

  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 400, position: [0, 17, 21] }}
        dpr={high ? [1, 1.75] : [1, 1.25]}
        shadows={high}
        frameloop={active ? "always" : "never"}
      >
        <Suspense fallback={null}>
          <City progress={progress} shadows={high} onReady={onReady} />
          {high && (
            <EffectComposer>
              <Bloom intensity={0.9} luminanceThreshold={1} mipmapBlur />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
