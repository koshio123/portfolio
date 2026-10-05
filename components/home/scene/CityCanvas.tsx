"use client";

import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { City } from "./City";

type Props = {
  /** スクロール量(0〜1)。毎フレーム読むので state ではなく ref で受け取る */
  progress: RefObject<number>;
  /** 画面外では描画を止める */
  active: boolean;
};

export default function CityCanvas({ progress, active }: Props) {
  return (
    <div className="absolute inset-0" aria-hidden>
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 200, position: [0, 30, 40] }}
        dpr={[1, 1.75]}
        frameloop={active ? "always" : "never"}
      >
        <City progress={progress} />
      </Canvas>
    </div>
  );
}
