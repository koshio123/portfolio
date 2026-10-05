"use client";

import type { Ref } from "react";
import type * as THREE from "three";

/** ドローン:機体と4つのローター、シアンのライト */
function Drone() {
  return (
    <group name="drone">
      <mesh castShadow>
        <boxGeometry args={[0.36, 0.1, 0.36]} />
        <meshStandardMaterial color="#e6ecf5" />
      </mesh>
      {[
        [0.26, 0.26],
        [-0.26, 0.26],
        [0.26, -0.26],
        [-0.26, -0.26],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.06, z]}>
          <cylinderGeometry args={[0.13, 0.13, 0.02, 12]} />
          <meshStandardMaterial color="#8fa3bf" transparent opacity={0.7} />
        </mesh>
      ))}
      {/* 荷物 */}
      <mesh position={[0, -0.13, 0]}>
        <boxGeometry args={[0.18, 0.14, 0.18]} />
        <meshStandardMaterial color="#f5b84a" />
      </mesh>
      <mesh position={[0, 0, 0.19]}>
        <boxGeometry args={[0.08, 0.04, 0.01]} />
        <meshBasicMaterial color={[0.24 * 3, 0.84 * 3, 0.96 * 3]} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** 配送ロボット:箱型の車体と、シアンの目 */
function DeliveryRobot() {
  return (
    <group name="robot">
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.3, 0.26, 0.4]} />
        <meshStandardMaterial color="#e6ecf5" />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <boxGeometry args={[0.26, 0.06, 0.36]} />
        <meshStandardMaterial color="#f5b84a" />
      </mesh>
      <mesh position={[0, 0.24, 0.205]}>
        <boxGeometry args={[0.16, 0.04, 0.01]} />
        <meshBasicMaterial color={[0.24 * 3, 0.84 * 3, 0.96 * 3]} toneMapped={false} />
      </mesh>
      {[-0.13, 0.13].map((z) =>
        [-0.16, 0.16].map((x) => (
          <mesh key={`${x}${z}`} position={[x, 0.06, z]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
            <meshStandardMaterial color="#1b1f27" />
          </mesh>
        )),
      )}
    </group>
  );
}

/** 第3幕で現れるドローン3機と配送ロボット2台。位置は City が毎フレーム動かす */
export function Helpers({ ref }: { ref: Ref<THREE.Group> }) {
  return (
    <group ref={ref}>
      <Drone />
      <Drone />
      <Drone />
      <DeliveryRobot />
      <DeliveryRobot />
    </group>
  );
}
