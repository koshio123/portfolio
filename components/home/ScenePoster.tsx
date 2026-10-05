import Image from "next/image";
import poster from "@/public/scene-poster.jpg";

/**
 * 3Dシーンの代わりに表示する静止画(動きを減らす設定・WebGL非対応の環境)。
 * 実際の3Dシーン(第3幕)を撮影した画像。街の見た目を大きく変えたら撮り直す。
 */
export function ScenePoster() {
  return (
    <Image
      src={poster}
      alt=""
      fill
      priority
      placeholder="blur"
      sizes="100vw"
      className="object-cover"
    />
  );
}
