"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { acts } from "@/content/vision";
import { ScenePoster } from "./ScenePoster";

// three.js はブラウザでのみ、必要になってから読み込む
const CityCanvas = dynamic(() => import("./scene/CityCanvas"), { ssr: false });

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

let webglSupported: boolean | undefined;
function hasWebGL() {
  if (webglSupported === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupported = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webglSupported = false;
    }
  }
  return webglSupported;
}

const subscribeNothing = () => () => {};

/**
 * Home の3Dシーン。セクションを幕の数 × 画面の高さぶん縦に伸ばし、
 * 中身を画面に固定(sticky)してスクロール量で幕を進める。
 */
export function VisionScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [act, setAct] = useState(0);
  const [inView, setInView] = useState(true);

  // サーバーでは静止画を描き、ブラウザで条件を満たせば3Dに切り替える
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
  const webgl = useSyncExternalStore(subscribeNothing, hasWebGL, () => false);
  const show3D = webgl && !reducedMotion;

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      // 固定された表示領域が、セクションの中をどれだけ進んだか
      const outer = section.getBoundingClientRect();
      const inner = sticky.getBoundingClientRect();
      const scrollable = outer.height - inner.height;
      const p = scrollable > 0 ? Math.min(1, Math.max(0, (inner.top - outer.top) / scrollable)) : 0;
      progress.current = p;
      setAct(Math.round(p * (acts.length - 1)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(section);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const current = acts[act];
  // 第4幕は夕日で背景が明るくなるため、文字を暗くする
  const onBright = show3D && act === acts.length - 1;

  return (
    <section
      ref={sectionRef}
      aria-label="ビジョンを表す3Dシーン"
      data-theme="night"
      className="relative bg-bg text-ink"
      style={{ height: `${acts.length * 100}svh` }}
    >
      <div
        ref={stickyRef}
        className="sticky overflow-hidden"
        style={{ top: "var(--header-h)", height: "calc(100svh - var(--header-h))" }}
      >
        {/* 静止画を常に下に敷き、3Dが描画されたら上に重なる */}
        <ScenePoster />
        {show3D && <CityCanvas progress={progress} active={inView} />}

        {current.title && (
          <div
            key={act}
            aria-live="polite"
            className={`absolute right-4 bottom-24 left-4 flex max-w-3xl animate-fade-up flex-col gap-3 md:bottom-18 md:left-14 ${
              onBright ? "text-on-accent" : "text-ink"
            }`}
          >
            <span className={`label ${onBright ? "text-on-accent" : "text-link"}`}>{current.kicker}</span>
            <span className="text-[2rem] leading-tight font-bold [word-break:auto-phrase] md:text-display">{current.title}</span>
          </div>
        )}

        <ol
          aria-label="シーンの進行"
          className={`absolute top-1/2 right-6 hidden -translate-y-1/2 flex-col gap-3.5 font-mono text-xs md:right-14 md:flex ${
            onBright ? "text-on-accent" : "text-ink-muted"
          }`}
        >
          {acts.map((a, i) => (
            <li
              key={a.step}
              aria-current={i === act ? "step" : undefined}
              className={`flex items-center gap-3 ${i === act && !onBright ? "text-link" : ""}`}
            >
              <span
                className={`size-2 rounded-full border border-current ${i === act ? "bg-current" : ""}`}
              />
              {a.step}
            </li>
          ))}
        </ol>

        {act === 0 && (
          <span className="label absolute bottom-8 left-1/2 -translate-x-1/2 tracking-[0.2em] text-ink-muted">
            SCROLL ↓
          </span>
        )}
        <a
          href="#vision"
          className={`absolute right-4 bottom-6 inline-flex min-h-11 items-center rounded-md border px-5 text-sm font-bold no-underline md:right-12 ${
            onBright
              ? "border-on-accent text-on-accent hover:text-on-accent"
              : "border-line-strong text-ink hover:text-ink"
          }`}
        >
          スキップ →
        </a>
      </div>
    </section>
  );
}
