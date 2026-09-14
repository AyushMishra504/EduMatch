"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; z: number };
type Palette = { accent: string; link: string };

function readPalette(): Palette | null {
  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue("--color-accent").trim();
  const muted = styles.getPropertyValue("--color-ink-muted").trim();
  if (!accent || !muted) return null;
  return { accent, link: muted };
}

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function NetworkCanvas3D({
  className,
  count = 32,
}: {
  className?: string;
  count?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let rafId = 0;
    let running = false;
    let isVisible = true;
    let rotation = 0;
    let palette: Palette =
      readPalette() ?? { accent: "#0e5a4f", link: "#5b5f57" };

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 2,
    }));

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) / 2.4;
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);
      const cosT = Math.cos(rotation * 0.55);
      const sinT = Math.sin(rotation * 0.55);

      const projected = particles.map((p) => {
        const x1 = p.x * cosR - p.z * sinR;
        const z1 = p.x * sinR + p.z * cosR;
        const y1 = p.y * cosT - z1 * sinT;
        const z2 = p.y * sinT + z1 * cosT;
        const persp = 1.6 / (1.6 + z2);
        return {
          x: cx + x1 * scale * persp,
          y: cy + y1 * scale * persp,
          depth: z2,
          persp,
        };
      });

      const link = withAlpha(palette.link, 0.24);
      ctx.lineWidth = 1;
      const THRESHOLD = 110;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < THRESHOLD * THRESHOLD) {
            ctx.strokeStyle = link;
            ctx.globalAlpha =
              Math.max(0, 1 - distSq / (THRESHOLD * THRESHOLD)) * 0.65;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      const node = withAlpha(palette.accent, 0.9);
      for (const p of projected) {
        ctx.fillStyle = node;
        ctx.globalAlpha = Math.min(1, (p.depth + 1) / 1.6) * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.7 * p.persp, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const tick = () => {
      if (!running) return;
      rotation += 0.0018;
      drawFrame();
      rafId = requestAnimationFrame(tick);
    };

    const syncRunning = () => {
      const shouldRun = isVisible && !document.hidden && !reduced;
      if (shouldRun && !running) {
        running = true;
        rafId = requestAnimationFrame(tick);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
      drawFrame();
    };

    const intersection = new IntersectionObserver((entries) => {
      isVisible = entries[0]?.isIntersecting ?? false;
      syncRunning();
    });
    intersection.observe(wrap);

    const themeObserver = new MutationObserver(() => {
      palette = readPalette() ?? palette;
      drawFrame();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const onVisibility = () => syncRunning();
    window.addEventListener("visibilitychange", onVisibility);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);

    resize();
    drawFrame();
    syncRunning();

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      intersection.disconnect();
      themeObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}