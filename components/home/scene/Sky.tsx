"use client";

import { useImperativeHandle, useMemo, type Ref } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 top;
  uniform vec3 bottom;
  varying vec3 vDir;
  void main() {
    float h = smoothstep(-0.02, 0.55, vDir.y);
    gl_FragColor = vec4(mix(bottom, top, h), 1.0);
    #include <colorspace_fragment>
  }
`;

export type SkyColors = { top: THREE.Color; bottom: THREE.Color };

/** 地平線から天頂へのグラデーションの空。色は ref から毎フレーム書き換える */
export function Sky({ ref }: { ref: Ref<SkyColors> }) {
  const uniforms = useMemo(
    () => ({ top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } }),
    [],
  );
  useImperativeHandle(ref, () => ({ top: uniforms.top.value, bottom: uniforms.bottom.value }), [uniforms]);

  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[150, 32, 16]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}
