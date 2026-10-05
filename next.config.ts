import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // ブログ記事(content/blog/*.mdx)を import できるようにする
  pageExtensions: ["ts", "tsx", "mdx"],
  // 開発サーバーは既定で localhost 以外からの読み込みを遮断する(ページの JS が動かなくなる)。
  // スマホなど LAN 内の端末から確認するときは、その IP(例:"192.168.1.20")をここに足す。
  allowedDevOrigins: ["127.0.0.1"],
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
