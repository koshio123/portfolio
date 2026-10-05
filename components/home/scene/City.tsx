"use client";

import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  buildings,
  houses,
  networkPositions,
  particleOrigins,
  ROAD_LENGTH,
  seededRandom,
  trees,
} from "./cityLayout";
import { phases, sampleKeyframes } from "./keyframes";

const CAR_COUNT = 16; // 2車線ぶん
const PARTICLE_COUNT = 420;
const SIGNAL_COUNT = 160;
const TWIN_Y = 12; // 上空のデジタルツインの高さ

const CYAN = new THREE.Color("#3dd6f5");
const GREEN = new THREE.Color("#5be3a1");
const BRAKE = new THREE.Color("#e5484d");
const WINDOW = new THREE.Color("#d9c27a");

const tmp = new THREE.Object3D();
const lookAt = new THREE.Vector3();

/** InstancedMesh に箱の配置を書き込む */
function placeBlocks(mesh: THREE.InstancedMesh, blocks: { x: number; z: number; w: number; d: number; h: number }[]) {
  blocks.forEach((b, i) => {
    tmp.position.set(b.x, b.h / 2, b.z);
    tmp.scale.set(b.w, b.h, b.d);
    tmp.rotation.set(0, 0, 0);
    tmp.updateMatrix();
    mesh.setMatrixAt(i, tmp.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
}

/** 粒子の起点・速度・位相を固定シードで作る */
function makeParticles(count: number, seed: number) {
  const rand = seededRandom(seed);
  const origin = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  const phase = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const o = particleOrigins[Math.floor(rand() * particleOrigins.length)];
    origin.set([o[0] + (rand() - 0.5) * 0.6, o[1], o[2] + (rand() - 0.5) * 0.6], i * 3);
    speed[i] = 0.15 + rand() * 0.25;
    phase[i] = rand();
  }
  return { origin, speed, phase, positions: new Float32Array(count * 3) };
}

export function City({ progress }: { progress: RefObject<number> }) {
  const ambient = useRef<THREE.AmbientLight>(null!);
  const sun = useRef<THREE.DirectionalLight>(null!);
  const groundMat = useRef<THREE.MeshStandardMaterial>(null!);
  const buildingMesh = useRef<THREE.InstancedMesh>(null!);
  const buildingMat = useRef<THREE.MeshStandardMaterial>(null!);
  const twinMesh = useRef<THREE.InstancedMesh>(null!);
  const twinMat = useRef<THREE.MeshBasicMaterial>(null!);
  const houseMesh = useRef<THREE.InstancedMesh>(null!);
  const houseMat = useRef<THREE.MeshStandardMaterial>(null!);
  const roofMesh = useRef<THREE.InstancedMesh>(null!);
  const treeMesh = useRef<THREE.InstancedMesh>(null!);
  const carMesh = useRef<THREE.InstancedMesh>(null!);
  const carMat = useRef<THREE.MeshStandardMaterial>(null!);
  const network = useRef<THREE.LineSegments>(null!);
  const networkMat = useRef<THREE.LineBasicMaterial>(null!);
  const particleGeo = useRef<THREE.BufferGeometry>(null!);
  const particleMat = useRef<THREE.PointsMaterial>(null!);
  const signalGeo = useRef<THREE.BufferGeometry>(null!);
  const signalMat = useRef<THREE.PointsMaterial>(null!);
  const helpers = useRef<THREE.Group>(null!); // ドローンと配送ロボット
  const background = useRef<THREE.Color>(null!);
  const fog = useRef<THREE.Fog>(null!);
  const travel = useRef(0);

  const particles = useMemo(() => makeParticles(PARTICLE_COUNT, 11), []);
  const signals = useMemo(() => makeParticles(SIGNAL_COUNT, 23), []);

  useLayoutEffect(() => {
    placeBlocks(buildingMesh.current, buildings);
    placeBlocks(twinMesh.current, buildings);
    placeBlocks(houseMesh.current, houses);
    houses.forEach((h, i) => {
      tmp.position.set(h.x, h.h + 0.3, h.z);
      tmp.scale.set(1, 1, 1);
      tmp.rotation.set(0, Math.PI / 4, 0);
      tmp.updateMatrix();
      roofMesh.current.setMatrixAt(i, tmp.matrix);
    });
    roofMesh.current.instanceMatrix.needsUpdate = true;
    trees.forEach((t, i) => {
      tmp.position.set(t.x, 0.5 * t.s, t.z);
      tmp.scale.setScalar(t.s);
      tmp.rotation.set(0, 0, 0);
      tmp.updateMatrix();
      treeMesh.current.setMatrixAt(i, tmp.matrix);
    });
    treeMesh.current.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const p = progress.current ?? 0;
    const ph = phases(p);
    const k = sampleKeyframes(p);
    const time = state.clock.elapsedTime;
    const damp = 1 - Math.exp(-delta * 3);

    // 空・光・地面・建物の色
    background.current.copy(k.sky);
    fog.current.color.copy(k.sky);
    ambient.current.intensity = k.ambient;
    sun.current.color.copy(k.sun);
    sun.current.intensity = k.sunIntensity;
    sun.current.position.copy(k.sunPosition);
    groundMat.current.color.copy(k.ground);
    buildingMat.current.color.copy(k.building);
    buildingMat.current.emissive.copy(WINDOW);
    buildingMat.current.emissiveIntensity = 0.12 * ph.chaos; // 点けっぱなしの照明
    houseMat.current.emissiveIntensity = 0.25 * ph.chaos + 0.2 * ph.sunset;

    // 縦長の画面では画角を広げる
    const cam = state.camera as THREE.PerspectiveCamera;
    const fov = state.size.width < state.size.height ? 62 : 45;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }

    // カメラは目標へ滑らかに寄せる
    state.camera.position.lerp(k.camera, damp);
    lookAt.lerp(k.target, damp);
    state.camera.lookAt(lookAt);

    // 01 ネットワークが伸びていく
    const total = networkPositions.length / 3;
    network.current.geometry.setDrawRange(0, Math.floor((total * ph.network) / 2) * 2);
    networkMat.current.opacity = 0.85 * ph.network * (1 - 0.7 * ph.sunset);

    // 02 データの粒子が上空へ。ツインが現れる
    const pos = particleGeo.current.attributes.position.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const f = (time * particles.speed[i] + particles.phase[i]) % 1;
      const oy = particles.origin[i * 3 + 1];
      const pull = 1 - 0.35 * f; // 上るほど中心へ寄る
      pos[i * 3] = particles.origin[i * 3] * pull;
      pos[i * 3 + 1] = oy + f * (TWIN_Y - oy);
      pos[i * 3 + 2] = particles.origin[i * 3 + 2] * pull;
    }
    particleGeo.current.attributes.position.needsUpdate = true;
    particleMat.current.opacity = ph.data;
    twinMat.current.opacity = 0.7 * ph.twin;
    twinMesh.current.visible = ph.twin > 0.01;

    // 03 ツインから信号が降り、街が整う
    const sig = signalGeo.current.attributes.position.array as Float32Array;
    for (let i = 0; i < SIGNAL_COUNT; i++) {
      const f = (time * signals.speed[i] * 1.4 + signals.phase[i]) % 1;
      sig[i * 3] = signals.origin[i * 3];
      sig[i * 3 + 1] = TWIN_Y - f * (TWIN_Y - signals.origin[i * 3 + 1]);
      sig[i * 3 + 2] = signals.origin[i * 3 + 2];
    }
    signalGeo.current.attributes.position.needsUpdate = true;
    signalMat.current.opacity = ph.optimize * (1 - ph.sunset);

    // 車:混沌では渋滞、最適化後は等間隔に流れる
    travel.current += delta * THREE.MathUtils.lerp(0.3, 5, ph.optimize);
    const perLane = CAR_COUNT / 2;
    const spacing = ROAD_LENGTH / perLane;
    for (let i = 0; i < CAR_COUNT; i++) {
      const lane = i < perLane ? 1 : -1;
      const n = i % perLane;
      const even = (((n * spacing + travel.current) % ROAD_LENGTH) + ROAD_LENGTH) % ROAD_LENGTH - ROAD_LENGTH / 2;
      const jam = -3 + n * 0.85;
      const x = THREE.MathUtils.lerp(even, jam, ph.chaos) * lane;
      tmp.position.set(x, 0.2, lane * 0.55);
      tmp.scale.set(0.8, 0.35, 0.4);
      tmp.rotation.set(0, 0, 0);
      tmp.updateMatrix();
      carMesh.current.setMatrixAt(i, tmp.matrix);
    }
    carMesh.current.instanceMatrix.needsUpdate = true;
    carMat.current.emissive.lerpColors(BRAKE, CYAN, ph.optimize);

    // ドローンと配送ロボットは最適化とともに現れる
    const s = ph.optimize;
    helpers.current.visible = s > 0.01;
    helpers.current.children.forEach((child, i) => {
      if (i < 3) {
        const a = time * 0.4 + (i * Math.PI * 2) / 3;
        child.position.set(Math.cos(a) * (6 + i), 6 + Math.sin(time + i), Math.sin(a) * (6 + i));
      } else {
        const t = (time * 0.15 + i * 0.5) % 1;
        child.position.set(THREE.MathUtils.lerp(10, -3, t), 0.15, 1.5 + (i - 3) * 0.3);
      }
      child.scale.setScalar(s);
    });
  });

  return (
    <>
      <color ref={background} attach="background" args={["#0e1726"]} />
      <fog ref={fog} attach="fog" args={["#0e1726", 40, 120]} />
      <ambientLight ref={ambient} />
      <directionalLight ref={sun} />

      {/* 地面と道路 */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial ref={groundMat} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <planeGeometry args={[ROAD_LENGTH, 2.2]} />
        <meshStandardMaterial color="#151a24" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <planeGeometry args={[2.2, ROAD_LENGTH]} />
        <meshStandardMaterial color="#151a24" />
      </mesh>

      {/* 建物・住宅・木 */}
      <instancedMesh ref={buildingMesh} args={[undefined, undefined, buildings.length]}>
        <boxGeometry />
        <meshStandardMaterial ref={buildingMat} roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={houseMesh} args={[undefined, undefined, houses.length]}>
        <boxGeometry />
        <meshStandardMaterial ref={houseMat} color="#c9cdd4" emissive="#f5b84a" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={roofMesh} args={[undefined, undefined, houses.length]}>
        <coneGeometry args={[1, 0.6, 4]} />
        <meshStandardMaterial color="#7a5a4f" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={treeMesh} args={[undefined, undefined, trees.length]}>
        <coneGeometry args={[0.45, 1, 6]} />
        <meshStandardMaterial color="#4e7a52" roughness={1} />
      </instancedMesh>

      {/* 車 */}
      <instancedMesh ref={carMesh} args={[undefined, undefined, CAR_COUNT]}>
        <boxGeometry />
        <meshStandardMaterial ref={carMat} color="#3a4252" emissiveIntensity={0.9} />
      </instancedMesh>

      {/* 01 ネットワーク */}
      <lineSegments ref={network}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[networkPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={networkMat} color={CYAN} transparent depthWrite={false} />
      </lineSegments>

      {/* 02 データの粒子と、上空のデジタルツイン */}
      <points>
        <bufferGeometry ref={particleGeo}>
          <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={particleMat} color={CYAN} size={0.14} transparent depthWrite={false} />
      </points>
      <group position={[0, TWIN_Y, 0]} scale={[0.75, 0.4, 0.75]}>
        <instancedMesh ref={twinMesh} args={[undefined, undefined, buildings.length]}>
          <boxGeometry />
          <meshBasicMaterial ref={twinMat} color="#7fe3ff" wireframe transparent depthWrite={false} />
        </instancedMesh>
      </group>

      {/* 03 ツインから降りる信号 */}
      <points>
        <bufferGeometry ref={signalGeo}>
          <bufferAttribute attach="attributes-position" args={[signals.positions, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={signalMat} color={GREEN} size={0.12} transparent depthWrite={false} />
      </points>

      {/* 03 ドローン(3機)と配送ロボット(2台) */}
      <group ref={helpers}>
        {[0, 1, 2].map((i) => (
          <mesh key={`drone-${i}`}>
            <boxGeometry args={[0.5, 0.12, 0.5]} />
            <meshStandardMaterial color="#e6ecf5" emissive="#3dd6f5" emissiveIntensity={0.4} />
          </mesh>
        ))}
        {[0, 1].map((i) => (
          <mesh key={`robot-${i}`}>
            <boxGeometry args={[0.35, 0.3, 0.3]} />
            <meshStandardMaterial color="#f5b84a" />
          </mesh>
        ))}
      </group>
    </>
  );
}
