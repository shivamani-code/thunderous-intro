import { useEffect, useRef, useCallback } from "react";

interface LightningArcsProps {
  active: boolean;
}

const LightningArcs = ({ active }: LightningArcsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const drawBolt = useCallback((
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    thickness: number,
    opacity: number
  ) => {
    const segments = 8 + Math.floor(Math.random() * 6);
    const dx = (x2 - x1) / segments;
    const dy = (y2 - y1) / segments;
    const jitter = 30 + Math.random() * 20;

    ctx.beginPath();
    ctx.moveTo(x1, y1);

    for (let i = 1; i < segments; i++) {
      const nx = x1 + dx * i + (Math.random() - 0.5) * jitter;
      const ny = y1 + dy * i + (Math.random() - 0.5) * jitter;
      ctx.lineTo(nx, ny);
    }
    ctx.lineTo(x2, y2);

    ctx.strokeStyle = `hsla(210, 100%, 70%, ${opacity})`;
    ctx.lineWidth = thickness;
    ctx.shadowColor = "hsl(210, 100%, 60%)";
    ctx.shadowBlur = 20;
    ctx.stroke();

    // Inner bright core
    ctx.strokeStyle = `hsla(210, 100%, 95%, ${opacity * 0.6})`;
    ctx.lineWidth = thickness * 0.3;
    ctx.shadowBlur = 10;
    ctx.stroke();
  }, []);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Thor is centered horizontally, bottom-anchored, ~85vh tall
    // We'll emit arcs from the upper-body / hammer area
    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Center point (Thor's torso/hammer area)
      const cx = w * 0.5;
      const cy = h * 0.35;

      // Random arcs radiating outward
      const numArcs = Math.random() < 0.3 ? 3 : Math.random() < 0.6 ? 2 : 1;

      for (let i = 0; i < numArcs; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * 180;
        const ex = cx + Math.cos(angle) * dist;
        const ey = cy + Math.sin(angle) * dist;
        const thick = 0.5 + Math.random() * 1.5;
        const op = 0.3 + Math.random() * 0.5;
        drawBolt(ctx, cx, cy, ex, ey, thick, op);

        // Branch from midpoint
        if (Math.random() < 0.4) {
          const mx = (cx + ex) / 2 + (Math.random() - 0.5) * 20;
          const my = (cy + ey) / 2 + (Math.random() - 0.5) * 20;
          const ba = angle + (Math.random() - 0.5) * 1.5;
          const bd = 40 + Math.random() * 80;
          drawBolt(ctx, mx, my, mx + Math.cos(ba) * bd, my + Math.sin(ba) * bd, thick * 0.5, op * 0.6);
        }
      }

      // Small sparks near the hammer (slightly right of center, upper area)
      if (Math.random() < 0.5) {
        const sx = cx + (Math.random() - 0.4) * 60;
        const sy = cy + (Math.random() - 0.5) * 40;
        for (let s = 0; s < 3; s++) {
          const sa = Math.random() * Math.PI * 2;
          const sd = 10 + Math.random() * 30;
          drawBolt(ctx, sx, sy, sx + Math.cos(sa) * sd, sy + Math.sin(sa) * sd, 0.3, 0.6);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    // Throttle to ~15fps for a flickering electric feel
    const throttled = () => {
      animate();
      setTimeout(() => {
        animFrameRef.current = requestAnimationFrame(throttled);
      }, 60 + Math.random() * 40);
    };
    throttled();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, drawBolt]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[25] pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default LightningArcs;
