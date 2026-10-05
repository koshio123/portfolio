"use client";

import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  CAR_MODELS,
  CAR_SCALE,
  createLayout,
  networkPositions,
  particleOrigins,
  ROAD_LENGTH,
  seededRandom,
} from "./cityLayout";
import { phases, sampleKeyframes } from "./keyframes";
import { Helpers } from "./Helpers";
import { Sky } from "./Sky";
import { useCityModels, type ModelData } from "./useCityModels";

const CAR_COUNT = 16; // 2車線ぶん
const PARTICLE_COUNT = 420;
const SIGNAL_COUNT = 160;
const TWIN_Y = 13; // 上空のデジタルツインの高さ

/** ブルームで光らせるため、1 を超える明るさにした色 */
const GLOW_CYAN = new THREE.Color("#3dd6f5").multiplyScalar(2.2);
const GLOW_GREEN = new THREE.Color("#5be3a1").multiplyScalar(2);

const tmp = new THREE.Object3D();
const lookAt = new THREE.Vector3();

/** 粒子の起点・速度・位相を固定シードで作る */
function makeParticles(origins: [number, number, number][], count: number, seed: number) {
  const rand = seededRandom(seed);
  const origin = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  const phase = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const o = origins[Math.floor(rand() * origins.length)];
    origin.set([o[0] + (rand() - 0.5) * 0.8, o[1], o[2] + (rand() - 0.5) * 0.8], i * 3);
    speed[i] = 0.15 + rand() * 0.25;
    phase[i] = rand();
  }
  return { origin, speed, phase, positions: new Float32Array(count * 3) };
}

/** 同じモデルを多数並べる(配置は固定) */
function StaticInstances({
  model,
  matrices,
  materials,
  shadows,
}: {
  model: ModelData;
  matrices: THREE.Matrix4[];
  materials: THREE.Material[];
  shadows: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    matrices.forEach((m, i) => ref.current.setMatrixAt(i, m));
    ref.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);
  return (
    <instancedMesh
      ref={ref}
      args={[model.geometry, materials, matrices.length]}
      castShadow={shadows}
      receiveShadow={shadows}
      frustumCulled={false}
    />
  );
}

export function City({ progress, shadows }: { progress: RefObject<number>; shadows: boolean }) {
  const models = useCityModels();
  const layout = useMemo(() => createLayout(models), [models]);
  const network = useMemo(() => networkPositions(layout), [layout]);
  const origins = useMemo(() => particleOrigins(layout), [layout]);
  const particles = useMemo(() => makeParticles(origins, PARTICLE_COUNT, 11), [origins]);
  const signals = useMemo(() => makeParticles(origins, SIGNAL_COUNT, 23), [origins]);
  const twinBlocks = useMemo(
    () =>
      layout.rooftops.map(([x, h, z]) => {
        tmp.position.set(x, h / 2, z);
        tmp.rotation.set(0, 0, 0);
        tmp.scale.set(1.5, h, 1.5);
        tmp.updateMatrix();
        return tmp.matrix.clone();
      }),
    [layout],
  );

  // 街のマテリアルは、幕ごとの色を掛けるためにモデルごとに複製する
  const tinted = useMemo(() => {
    const byModel: Record<string, THREE.Material[]> = {};
    for (const [id, model] of Object.entries(models)) {
      byModel[id] = model.materials.map((m) => m.clone());
    }
    return byModel;
  }, [models]);

  // 車:モデルを順番に割り当てる
  const cars = useMemo(
    () => Array.from({ length: CAR_COUNT }, (_, i) => ({ model: CAR_MODELS[i % CAR_MODELS.length], index: Math.floor(i / CAR_MODELS.length) })),
    [],
  );

  const ambient = useRef<THREE.AmbientLight>(null!);
  const sun = useRef<THREE.DirectionalLight>(null!);
  const groundMat = useRef<THREE.MeshStandardMaterial>(null!);
  const fog = useRef<THREE.Fog>(null!);
  const skyRef = useRef<{ top: THREE.Color; bottom: THREE.Color }>(null!);
  const twinMesh = useRef<THREE.InstancedMesh>(null!);
  const twinMat = useRef<THREE.MeshBasicMaterial>(null!);
  const lines = useRef<THREE.LineSegments>(null!);
  const linesMat = useRef<THREE.LineBasicMaterial>(null!);
  const particleGeo = useRef<THREE.BufferGeometry>(null!);
  const particleMat = useRef<THREE.PointsMaterial>(null!);
  const signalGeo = useRef<THREE.BufferGeometry>(null!);
  const signalMat = useRef<THREE.PointsMaterial>(null!);
  const helpers = useRef<THREE.Group>(null!);
  const carMeshes = useRef<Record<string, THREE.InstancedMesh>>({});
  const travel = useRef(0);

  useLayoutEffect(() => {
    twinBlocks.forEach((m, i) => twinMesh.current.setMatrixAt(i, m));
    twinMesh.current.instanceMatrix.needsUpdate = true;
  }, [twinBlocks]);

  useFrame((state, delta) => {
    const p = progress.current ?? 0;
    const ph = phases(p);
    const k = sampleKeyframes(p);
    const time = state.clock.elapsedTime;
    const damp = 1 - Math.exp(-delta * 3);

    // 空・光・地面・街の色
    skyRef.current.top.copy(k.sky);
    skyRef.current.bottom.copy(k.horizon);
    fog.current.color.copy(k.horizon);
    ambient.current.intensity = k.ambient;
    sun.current.color.copy(k.sun);
    sun.current.intensity = k.sunIntensity;
    sun.current.position.copy(k.sunPosition);
    groundMat.current.color.copy(k.ground);
    for (const list of Object.values(tinted)) {
      for (const m of list) (m as THREE.MeshStandardMaterial).color.copy(k.tint);
    }

    // 縦長の画面では画角を広げる
    const cam = state.camera as THREE.PerspectiveCamera;
    const fov = state.size.width < state.size.height ? 62 : 45;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    // カメラは目標へ滑らかに寄せる
    cam.position.lerp(k.camera, damp);
    lookAt.lerp(k.target, damp);
    cam.lookAt(lookAt);

    // 01 ネットワークが伸びていく
    const total = network.length / 3;
    lines.current.geometry.setDrawRange(0, Math.floor((total * ph.network) / 2) * 2);
    linesMat.current.opacity = 0.9 * ph.network * (1 - 0.7 * ph.sunset);

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
    twinMat.current.opacity = 0.6 * ph.twin;
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
    cars.forEach((car, i) => {
      const lane = i % 2 === 0 ? 1 : -1;
      const n = Math.floor(i / 2);
      const even = ((((n * spacing + travel.current) % ROAD_LENGTH) + ROAD_LENGTH) % ROAD_LENGTH) - ROAD_LENGTH / 2;
      const jam = -3.5 + n * 1.05;
      tmp.position.set(THREE.MathUtils.lerp(even, jam, ph.chaos) * lane, 0.03, lane * 0.5);
      tmp.rotation.set(0, (lane * Math.PI) / 2, 0);
      tmp.scale.setScalar(CAR_SCALE);
      tmp.updateMatrix();
      const mesh = carMeshes.current[car.model];
      if (mesh) mesh.setMatrixAt(car.index, tmp.matrix);
    });
    for (const mesh of Object.values(carMeshes.current)) mesh.instanceMatrix.needsUpdate = true;

    // 03 ドローンと配送ロボット
    const s = ph.optimize;
    helpers.current.visible = s > 0.01;
    helpers.current.children.forEach((child, i) => {
      if (child.name === "drone") {
        const a = time * 0.4 + (i * Math.PI * 2) / 3;
        child.position.set(Math.cos(a) * (6 + i), 6 + Math.sin(time + i) * 0.6, Math.sin(a) * (6 + i));
        child.rotation.y = -a;
      } else {
        const t = (time * 0.12 + i * 0.5) % 1;
        child.position.set(THREE.MathUtils.lerp(10, -2, t), 0.02, 1.55 + (i % 2) * 0.25);
        child.rotation.y = -Math.PI / 2;
      }
      child.scale.setScalar(s);
    });
  });

  return (
    <>
      <Sky ref={skyRef} />
      <fog ref={fog} attach="fog" args={["#16284a", 40, 120]} />
      <ambientLight ref={ambient} />
      <directionalLight
        ref={sun}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={90}
      />

      {/* 地面 */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02} receiveShadow={shadows}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial ref={groundMat} roughness={1} />
      </mesh>

      {/* 建物・住宅・木・道路 */}
      {Object.entries(layout.instances).map(([id, matrices]) => (
        <StaticInstances key={id} model={models[id]} matrices={matrices} materials={tinted[id]} shadows={shadows} />
      ))}

      {/* 車(位置は毎フレーム更新) */}
      {CAR_MODELS.map((id) => (
        <instancedMesh
          key={id}
          ref={(mesh) => {
            if (mesh) carMeshes.current[id] = mesh;
          }}
          args={[models[id].geometry, tinted[id], cars.filter((c) => c.model === id).length]}
          castShadow={shadows}
          frustumCulled={false}
        />
      ))}

      {/* 01 ネットワーク */}
      <lineSegments ref={lines}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[network, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={linesMat} color={GLOW_CYAN} transparent depthWrite={false} toneMapped={false} />
      </lineSegments>

      {/* 02 データの粒子と、上空のデジタルツイン */}
      <points>
        <bufferGeometry ref={particleGeo}>
          <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={particleMat} color={GLOW_CYAN} size={0.14} transparent depthWrite={false} toneMapped={false} />
      </points>
      <group position={[0, TWIN_Y, 0]} scale={[0.75, 0.4, 0.75]}>
        <instancedMesh ref={twinMesh} args={[undefined, undefined, twinBlocks.length]} frustumCulled={false}>
          <boxGeometry />
          <meshBasicMaterial ref={twinMat} color="#7fe3ff" wireframe transparent depthWrite={false} />
        </instancedMesh>
      </group>

      {/* 03 ツインから降りる信号 */}
      <points>
        <bufferGeometry ref={signalGeo}>
          <bufferAttribute attach="attributes-position" args={[signals.positions, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={signalMat} color={GLOW_GREEN} size={0.12} transparent depthWrite={false} toneMapped={false} />
      </points>

      {/* 03 ドローン(3機)と配送ロボット(2台) */}
      <Helpers ref={helpers} />
    </>
  );
}
