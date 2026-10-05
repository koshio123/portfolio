"use client";

import { useEffect } from "react";

/**
 * 固定ヘッダーの実際の高さを CSS 変数 --header-h に書き込む。
 * アンカーリンクの着地位置と、Home の3Dシーンの表示領域に使う。
 */
export function HeaderHeightVar() {
  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty("--header-h", `${header.offsetHeight}px`);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  return null;
}
