"use client";

import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** scripts/build-city-assets.mjs が書き出す、Kenney 素材をまとめた GLB */
export const CITY_MODELS_URL = "/models/city.glb";

export type ModelData = {
  /** モデル内の全メッシュを1つにまとめたジオメトリ(メッシュごとに group を持つ) */
  geometry: THREE.BufferGeometry;
  /** group と同じ順番のマテリアル */
  materials: THREE.Material[];
  /** 外寸(拡大縮小の計算に使う) */
  size: THREE.Vector3;
};

export type CityModels = Record<string, ModelData>;

const KEEP = ["position", "normal", "uv"];

/** 量子化された属性(meshopt 圧縮で整数化される)を float に戻す */
function toFloat(attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) {
  const { count, itemSize } = attr;
  const out = new Float32Array(count * itemSize);
  const get = [attr.getX, attr.getY, attr.getZ, attr.getW];
  for (let i = 0; i < count; i++) {
    for (let c = 0; c < itemSize; c++) out[i * itemSize + c] = get[c].call(attr, i);
  }
  return new THREE.Float32BufferAttribute(out, itemSize);
}

/** モデル(ノード)配下のメッシュを、ノード基準の座標で1つのジオメトリにまとめる */
function prepare(root: THREE.Object3D): ModelData {
  root.updateMatrixWorld(true);
  const toRoot = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    let geometry = new THREE.BufferGeometry();
    for (const name of KEEP) {
      const attr = mesh.geometry.getAttribute(name);
      if (attr) geometry.setAttribute(name, toFloat(attr));
    }
    if (mesh.geometry.index) geometry.setIndex(mesh.geometry.index.clone());
    geometry = geometry.index ? geometry.toNonIndexed() : geometry;
    if (!geometry.getAttribute("uv")) {
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(geometry.getAttribute("position").count * 2), 2));
    }
    if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
    geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(toRoot, mesh.matrixWorld));
    geometries.push(geometry);
    materials.push(Array.isArray(mesh.material) ? mesh.material[0] : mesh.material);
  });

  const geometry = mergeGeometries(geometries, true);
  geometry.computeBoundingBox();
  const size = geometry.boundingBox!.getSize(new THREE.Vector3());
  return { geometry, materials, size };
}

/** 街のモデルを読み込み、モデル ID ごとのジオメトリとマテリアルにして返す */
export function useCityModels(): CityModels {
  const gltf = useLoader(GLTFLoader, CITY_MODELS_URL, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  return useMemo(() => {
    const models: CityModels = {};
    for (const node of gltf.scene.children) models[node.name] = prepare(node);
    return models;
  }, [gltf]);
}
