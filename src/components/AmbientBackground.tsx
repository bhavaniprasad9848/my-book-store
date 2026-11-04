"use client";

import { useEffect, useRef } from "react";

/*
 * Living background drawn on a canvas behind the whole app:
 * soft bokeh lights drifting up, dust motes sparkling in light,
 * and book pages fluttering across the screen, with mouse parallax.
 * Pauses when the tab is hidden; renders one still frame for reduced motion.
 */

type Orb = { x: number; y: number; r: number; vy: number; vx: number; hue: string; a: number; depth: number; phase: number };
type Mote = { x: number; y: number; r: number; vx: number; vy: number; phase: number; depth: number };
type Page = { x: number; y: number; w: number; h: number; vx: number; vy: number; rot: number; vr: number; flip: number; vf: number; depth: number; lines: number };

const ORB_COLORS = ["245, 166, 60", "250, 204, 120", "70, 160, 110", "90, 150, 215", "235, 120, 90"];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    let orbs: Orb[] = [];
    let motes: Mote[] = [];
    let pages: Page[] = [];

    function makeOrb(fresh = false): Orb {
      const depth = rand(0.3, 1);
      return {
        x: rand(0, w),
        y: fresh ? rand(0, h) : h + rand(40, 200),
        r: rand(26, 90) * depth,
        vy: -rand(6, 18) * depth,
        vx: rand(-4, 4),
        hue: ORB_COLORS[Math.floor(Math.random() * ORB_COLORS.length)],
        a: rand(0.22, 0.42),
        depth,
        phase: rand(0, Math.PI * 2),
      };
    }

    function makeMote(fresh = false): Mote {
      return {
        x: rand(0, w),
        y: fresh ? rand(0, h) : h + 10,
        r: rand(0.9, 2.4),
        vx: rand(-6, 6),
        vy: -rand(4, 14),
        phase: rand(0, Math.PI * 2),
        depth: rand(0.4, 1),
      };
    }

    function makePage(fresh = false): Page {
      const depth = rand(0.45, 1);
      const size = rand(26, 46) * depth;
      const fromLeft = Math.random() < 0.7;
      return {
        x: fresh ? rand(0, w) : fromLeft ? -60 : w + 60,
        y: rand(h * 0.05, h * 0.85),
        w: size,
        h: size * 1.3,
        vx: (fromLeft ? 1 : -1) * rand(18, 40) * depth,
        vy: rand(-6, 8),
        rot: rand(-0.6, 0.6),
        vr: rand(-0.5, 0.5),
        flip: rand(0, Math.PI * 2),
        vf: rand(1.2, 2.6),
        depth,
        lines: Math.floor(rand(4, 7)),
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const area = (w * h) / (1280 * 800);
      const small = w < 640;
      orbs = Array.from({ length: Math.round((small ? 10 : 22) * Math.max(0.6, area)) }, () => makeOrb(true));
      motes = Array.from({ length: Math.round((small ? 30 : 70) * Math.max(0.6, area)) }, () => makeMote(true));
      pages = Array.from({ length: small ? 3 : 6 }, () => makePage(true));
    }

    function drawRays(t: number) {
      const cx = w * 0.82 + mouse.x * 10;
      const cy = -h * 0.15 + mouse.y * 6;
      for (let i = 0; i < 4; i++) {
        const angle = Math.PI * 0.62 + i * 0.12 + Math.sin(t * 0.00012 + i) * 0.05;
        const spread = 0.05 + i * 0.012;
        const len = h * 1.6;
        const g = ctx!.createLinearGradient(cx, cy, cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
        const strength = 0.16 + 0.07 * Math.sin(t * 0.0004 + i * 1.7);
        g.addColorStop(0, `rgba(255, 214, 140, ${strength})`);
        g.addColorStop(1, "rgba(255, 214, 140, 0)");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.moveTo(cx, cy);
        ctx!.lineTo(cx + Math.cos(angle - spread) * len, cy + Math.sin(angle - spread) * len);
        ctx!.lineTo(cx + Math.cos(angle + spread) * len, cy + Math.sin(angle + spread) * len);
        ctx!.closePath();
        ctx!.fill();
      }
    }

    function drawOrb(o: Orb, t: number) {
      const px = o.x + mouse.x * 30 * o.depth;
      const py = o.y + mouse.y * 20 * o.depth;
      const twinkle = 0.75 + 0.25 * Math.sin(t * 0.0012 + o.phase);
      const g = ctx!.createRadialGradient(px, py, 0, px, py, o.r);
      g.addColorStop(0, `rgba(${o.hue}, ${o.a * twinkle})`);
      g.addColorStop(0.55, `rgba(${o.hue}, ${o.a * 0.45 * twinkle})`);
      g.addColorStop(1, `rgba(${o.hue}, 0)`);
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(px, py, o.r, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawMote(m: Mote, t: number) {
      const px = m.x + mouse.x * 14 * m.depth;
      const py = m.y + mouse.y * 10 * m.depth;
      const a = 0.3 + 0.6 * Math.max(0, Math.sin(t * 0.003 + m.phase));
      ctx!.fillStyle = `rgba(214, 150, 50, ${a})`;
      ctx!.shadowColor = "rgba(255, 190, 80, 0.9)";
      ctx!.shadowBlur = 6;
      ctx!.beginPath();
      ctx!.arc(px, py, m.r, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawPage(p: Page) {
      const px = p.x + mouse.x * 40 * p.depth;
      const py = p.y + mouse.y * 26 * p.depth;
      const sx = Math.cos(p.flip); // page turning in 3D
      const shade = 0.82 + 0.18 * Math.abs(sx);
      ctx!.save();
      ctx!.translate(px, py);
      ctx!.rotate(p.rot);
      ctx!.scale(Math.max(0.08, Math.abs(sx)), 1);
      ctx!.globalAlpha = 0.72 + 0.25 * p.depth;
      ctx!.shadowColor = "rgba(40, 30, 20, 0.28)";
      ctx!.shadowBlur = 10 * p.depth;
      ctx!.shadowOffsetY = 6 * p.depth;
      // paper with a gentle curl
      ctx!.fillStyle = `rgb(${Math.round(252 * shade)}, ${Math.round(246 * shade)}, ${Math.round(232 * shade)})`;
      ctx!.beginPath();
      ctx!.moveTo(-p.w / 2, -p.h / 2);
      ctx!.lineTo(p.w / 2, -p.h / 2);
      ctx!.quadraticCurveTo(p.w / 2 + 4, 0, p.w / 2, p.h / 2);
      ctx!.lineTo(-p.w / 2, p.h / 2);
      ctx!.quadraticCurveTo(-p.w / 2 - 3, 0, -p.w / 2, -p.h / 2);
      ctx!.fill();
      ctx!.shadowColor = "transparent";
      if (sx > 0) {
        ctx!.strokeStyle = "rgba(90, 80, 70, 0.35)";
        ctx!.lineWidth = 1;
        for (let i = 0; i < p.lines; i++) {
          const ly = -p.h / 2 + p.h * 0.18 + i * (p.h * 0.7) / p.lines;
          ctx!.beginPath();
          ctx!.moveTo(-p.w / 2 + p.w * 0.15, ly);
          ctx!.lineTo(p.w / 2 - p.w * (i === p.lines - 1 ? 0.45 : 0.15), ly);
          ctx!.stroke();
        }
      }
      ctx!.restore();
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      ctx!.clearRect(0, 0, w, h);
      drawRays(now);

      for (const o of orbs) {
        o.y += o.vy * dt;
        o.x += (o.vx + Math.sin(now * 0.0005 + o.phase) * 6) * dt;
        if (o.y < -o.r - 20) Object.assign(o, makeOrb());
        drawOrb(o, now);
      }
      for (const m of motes) {
        m.y += m.vy * dt;
        m.x += (m.vx + Math.sin(now * 0.001 + m.phase) * 8) * dt;
        if (m.y < -10 || m.x < -10 || m.x > w + 10) Object.assign(m, makeMote());
        drawMote(m, now);
      }
      ctx!.shadowBlur = 0;
      ctx!.shadowColor = "transparent";
      for (const p of pages) {
        p.x += p.vx * dt;
        p.y += (p.vy + Math.sin(now * 0.0015 + p.flip) * 14) * dt;
        p.rot += p.vr * dt;
        p.flip += p.vf * dt;
        if (p.x < -90 || p.x > w + 90 || p.y < -90 || p.y > h + 90) Object.assign(p, makePage());
        drawPage(p);
      }

      raf = requestAnimationFrame(frame);
    }

    function onMove(e: MouseEvent) {
      mouse.tx = e.clientX / w - 0.5;
      mouse.ty = e.clientY / h - 0.5;
    }

    function onVisibility() {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    resize();
    if (reduce) {
      frame(performance.now());
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="ambient-bg" aria-hidden="true" />;
}
