"use client";

import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AiCore, type AiHandle } from "./AiCore";
import { CAR_MODELS, CAR_SCALE, createLayout, networkPositions, particleOrigins, seededRandom } from "./cityLayout";
import { phases, sampleKeyframes } from "./keyframes";
import { HELPER_COUNT, Helpers } from "./Helpers";
import { NetworkLines, type NetworkHandle } from "./NetworkLines";
import { Sky } from "./Sky";
import { advanceTravel, carCountByModel, CARS, placeCar } from "./traffic";
import { useCityModels, type ModelData } from "./useCityModels";

const PARTICLE_COUNT = 420;
const TWIN_Y = 13; // 上空のデジタルツインの高さ

// 03 で AI が見ている対象:車(AI_CAR_EVERY 台に 1 台)、ドローンとロボット、住宅の一部
const AI_CAR_EVERY = 5;
const AI_CARS = Math.ceil(CARS.length / AI_CAR_EVERY);
const AI_HOMES = 4;

/** ブルームで光らせるため、1 を超える明るさにした色 */
const GLOW_CYAN = new THREE.Color("#3dd6f5").multiplyScalar(2.2);

const tmp = new THREE.Object3D();
const lookAt = new THREE.Vector3();
const aiPoint = new THREE.Vector3();
const carPose = { position: new THREE.Vector3(), heading: 0, visible: 1 };

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

type Props = {
  progress: RefObject<number>;
  shadows: boolean;
  /** 最初のフレームを描き終えたら呼ぶ */
  onReady: () => void;
};

export function City({ progress, shadows, onReady }: Props) {
  const models = useCityModels();
  const layout = useMemo(() => createLayout(models), [models]);
  const network = useMemo(() => networkPositions(layout), [layout]);
  const origins = useMemo(() => particleOrigins(layout), [layout]);
  const particles = useMemo(() => makeParticles(origins, PARTICLE_COUNT, 11), [origins]);
  const aiHomes = useMemo(() => layout.homes.filter((_, i) => i % 4 === 1).slice(0, AI_HOMES), [layout]);
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

  const ambient = useRef<THREE.AmbientLight>(null!);
  const sun = useRef<THREE.DirectionalLight>(null!);
  const groundMat = useRef<THREE.MeshStandardMaterial>(null!);
  const fog = useRef<THREE.Fog>(null!);
  const skyRef = useRef<{ top: THREE.Color; bottom: THREE.Color }>(null!);
  const twinMesh = useRef<THREE.InstancedMesh>(null!);
  const twinMat = useRef<THREE.MeshBasicMaterial>(null!);
  const lines = useRef<NetworkHandle>(null!);
  const particleGeo = useRef<THREE.BufferGeometry>(null!);
  const particleMat = useRef<THREE.PointsMaterial>(null!);
  const ai = useRef<AiHandle>(null!);
  const helpers = useRef<THREE.Group>(null!);
  const carMeshes = useRef<Record<string, THREE.InstancedMesh>>({});
  const travel = useRef(0);
  const frames = useRef(0);

  useLayoutEffect(() => {
    twinBlocks.forEach((m, i) => twinMesh.current.setMatrixAt(i, m));
    twinMesh.current.instanceMatrix.needsUpdate = true;
  }, [twinBlocks]);

  useFrame((state, delta) => {
    // 2フレーム目(1フレーム目の描画が済んだあと)に準備完了を知らせる
    if (frames.current < 2 && ++frames.current === 2) onReady();

    const p = progress.current ?? 0;
    const ph = phases(p);
    const k = sampleKeyframes(p);
    const time = state.clock.elapsedTime;
    const damp = frames.current < 2 ? 1 : 1 - Math.exp(-delta * 3);

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
    lines.current.update(ph.network, ph.network * (1 - 0.7 * ph.sunset), time);

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

    // 車(動きの規則は traffic.ts)
    travel.current = advanceTravel(travel.current, delta, ph.chaos, ph.optimize);
    CARS.forEach((car, i) => {
      placeCar(i, travel.current, ph.chaos, carPose);
      tmp.position.copy(carPose.position).setY(0.03);
      tmp.rotation.set(0, carPose.heading, 0);
      tmp.scale.setScalar(CAR_SCALE * carPose.visible);
      tmp.updateMatrix();
      carMeshes.current[car.model]?.setMatrixAt(car.index, tmp.matrix);
      if (i % AI_CAR_EVERY === 0) {
        ai.current.setTarget(i / AI_CAR_EVERY, aiPoint.copy(carPose.position).setY(0.25), 0.45 * carPose.visible);
      }
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
      ai.current.setTarget(AI_CARS + i, aiPoint.copy(child.position).setY(child.position.y + (child.name === "drone" ? 0 : 0.2)), 0.4);
    });

    // 03 AIの核と、街への指令・検出枠
    aiHomes.forEach(([x, h, z], i) => ai.current.setTarget(AI_CARS + HELPER_COUNT + i, aiPoint.set(x, h / 2, z), 0.85));
    ai.current.update(cam, s * (1 - ph.sunset), s, time);
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
          args={[models[id].geometry, tinted[id], carCountByModel(id)]}
          castShadow={shadows}
          frustumCulled={false}
        />
      ))}

      {/* 01 ネットワーク */}
      <NetworkLines ref={lines} positions={network} />

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

      {/* 03 AIの核(ツインの中心)と、街への指令 */}
      <AiCore ref={ai} count={AI_CARS + HELPER_COUNT + aiHomes.length} position={[0, TWIN_Y + 1.4, 0]} />

      {/* 03 ドローン(3機)と配送ロボット(2台) */}
      <Helpers ref={helpers} />
    </>
  );
}
