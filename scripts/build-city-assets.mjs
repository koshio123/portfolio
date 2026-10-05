/**
 * Home の3Dシーンで使うモデルを、Kenney の CC0 素材から1つの GLB にまとめる。
 *
 *   npm run assets
 *
 * 1. 下の KITS の zip を取得(.cache/kenney に保存して再利用)
 * 2. MODELS に並べたモデルだけを取り出し、ノード名をモデル ID にして1つのシーンへ統合
 * 3. 重複除去・不要データ削除・meshopt 圧縮をして public/models/city.glb に書き出す
 *
 * 使うモデルを増やすときは MODELS に追加して再実行する。
 * 素材:Kenney (https://kenney.nl) — CC0 1.0。クレジット表記は不要だが README に出典を残している。
 */
import fs from "node:fs/promises";
import path from "node:path";
import { unzipSync } from "fflate";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt, mergeDocuments, prune } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, ".cache/kenney");
const OUT = path.join(ROOT, "public/models/city.glb");

const KITS = {
  commercial: "https://kenney.nl/media/pages/assets/city-kit-commercial/a742d900eb-1753115042/kenney_city-kit-commercial_2.1.zip",
  suburban: "https://kenney.nl/media/pages/assets/city-kit-suburban/2c871b7af2-1745479373/kenney_city-kit-suburban_20.zip",
  roads: "https://kenney.nl/media/pages/assets/city-kit-roads/74288c9459-1787042796/kenney_city-kit-roads.zip",
  cars: "https://kenney.nl/media/pages/assets/car-kit/1a312ec241-1775131960/kenney_car-kit.zip",
  furniture: "https://kenney.nl/media/pages/assets/furniture-kit/440e0608a4-1677580847/kenney_furniture-kit.zip",
};

/** モデル ID → [キット, zip 内のファイル名] */
const letters = (s) => [...s];
const MODELS = {
  ...Object.fromEntries(letters("abcdefghijklmn").map((c) => [`building-${c}`, ["commercial", `building-${c}.glb`]])),
  ...Object.fromEntries(letters("abcde").map((c) => [`skyscraper-${c}`, ["commercial", `building-skyscraper-${c}.glb`]])),
  ...Object.fromEntries(letters("abcdefgh").map((c) => [`house-${c}`, ["suburban", `building-type-${c}.glb`]])),
  "tree-large": ["suburban", "tree-large.glb"],
  "tree-small": ["suburban", "tree-small.glb"],
  "road-straight": ["roads", "road-straight.glb"],
  "road-crossroad": ["roads", "road-crossroad.glb"],
  ...Object.fromEntries(
    ["sedan", "suv", "taxi", "van", "hatchback-sports", "delivery"].map((n) => [`car-${n}`, ["cars", `${n}.glb`]]),
  ),
  ...Object.fromEntries(
    ["kitchenStove", "kitchenFridge", "kitchenCabinet", "washer", "table", "loungeSofa"].map((n) => [`furniture-${n}`, ["furniture", `${n}.glb`]]),
  ),
};

/** zip を取得して .cache/kenney/<kit>/ に展開し、中のファイルパス一覧を返す(テクスチャは外部参照なので展開が必要) */
async function loadKit(name) {
  const dir = path.join(CACHE, name);
  const zipFile = path.join(CACHE, `${name}.zip`);
  let zip;
  try {
    zip = new Uint8Array(await fs.readFile(zipFile));
  } catch {
    console.log(`download ${name}`);
    const res = await fetch(KITS[name]);
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    zip = new Uint8Array(await res.arrayBuffer());
    await fs.mkdir(CACHE, { recursive: true });
    await fs.writeFile(zipFile, zip);
  }
  const entries = unzipSync(zip);
  for (const [entry, data] of Object.entries(entries)) {
    if (entry.endsWith("/")) continue;
    const out = path.join(dir, entry);
    await fs.mkdir(path.dirname(out), { recursive: true });
    await fs.writeFile(out, data);
  }
  return Object.keys(entries).map((e) => path.join(dir, e));
}

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });

const kits = {};
const target = new (await import("@gltf-transform/core")).Document();
const scene = target.createScene("city");
target.createBuffer();

for (const [id, [kit, fileName]] of Object.entries(MODELS)) {
  kits[kit] ??= await loadKit(kit);
  const file = kits[kit].find((p) => p.endsWith(`/${fileName}`) && /GLB|GLTF/i.test(p));
  if (!file) throw new Error(`${id}: ${fileName} not found in ${kit}`);

  const source = await io.read(file);
  const map = mergeDocuments(target, source);
  // 取り込んだシーンの中身を、モデル ID 名のノード1つにまとめる
  const group = target.createNode(id);
  for (const child of source.getRoot().getDefaultScene().listChildren()) group.addChild(map.get(child));
  scene.addChild(group);
}

// 取り込みで増えたシーンと、共通化できるバッファ・テクスチャを整理する
for (const s of target.getRoot().listScenes()) if (s !== scene) s.dispose();
target.getRoot().setDefaultScene(scene);
const [main, ...extra] = target.getRoot().listBuffers();
for (const b of extra) {
  b.listParents().forEach((p) => p !== target.getRoot() && p.setBuffer?.(main));
  b.dispose();
}

await target.transform(dedup(), prune(), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
await fs.mkdir(path.dirname(OUT), { recursive: true });
await io.write(OUT, target);
const size = (await fs.stat(OUT)).size;
console.log(`wrote ${path.relative(ROOT, OUT)} (${(size / 1024).toFixed(0)} KB, ${Object.keys(MODELS).length} models)`);
