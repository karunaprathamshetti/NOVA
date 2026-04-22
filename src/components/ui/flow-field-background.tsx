import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NeuralBackgroundProps {
  className?: string;
  color?: string;
  trailOpacity?: number;
  particleCount?: number;
  speed?: number;
  scale?: number;
}

export default function NeuralBackground({
  className,
  color = "#C17B74",
  trailOpacity = 0.12,
  particleCount = 800,
  speed = 1,
  scale = 1,
}: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let particles: Particle[] = [];
    let animationFrameId: number;

    // Track mouse in page coordinates — works even with pointer-events-none
    const mouse = { x: -9999, y: -9999, active: false };

    // Parse color to RGB for glow effect
    const parseColor = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };
    const rgb = parseColor(color);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      age: number;
      life: number;
      size: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 250 + 100;
        this.size = Math.random() * 1.5 + 0.5;
      }

      update() {
        // 1. Flow field
        const angle = (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI;
        this.vx += Math.cos(angle) * 0.15 * speed;
        this.vy += Math.sin(angle) * 0.15 * speed;

        // 2. Cursor attraction — use canvas-relative position
        const rect = canvas.getBoundingClientRect();
        const localMouseX = mouse.x - rect.left;
        const localMouseY = mouse.y - rect.top;

        const dx = localMouseX - this.x;
        const dy = localMouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const attractRadius = 220;

        if (mouse.active && dist < attractRadius && dist > 1) {
          // Strong attraction: particles pull toward cursor
          const force = Math.pow((attractRadius - dist) / attractRadius, 2);
          this.vx += (dx / dist) * force * 2.5;
          this.vy += (dy / dist) * force * 2.5;

          // Very close: slight repulsion to avoid clumping
          if (dist < 40) {
            this.vx -= (dx / dist) * 3.0;
            this.vy -= (dy / dist) * 3.0;
          }
        }

        // 3. Apply velocity & friction
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.92;
        this.vy *= 0.92;

        // 4. Age
        this.age++;
        if (this.age > this.life) this.reset();

        // 5. Wrap
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 250 + 100;
        this.size = Math.random() * 1.5 + 0.5;
      }

      draw(context: CanvasRenderingContext2D) {
        // Base fade in/out
        const baseAlpha = 1 - Math.abs((this.age / this.life) - 0.5) * 2;

        // Boost alpha & size for particles near cursor
        const rect = canvas.getBoundingClientRect();
        const localMouseX = mouse.x - rect.left;
        const localMouseY = mouse.y - rect.top;
        const dx = localMouseX - this.x;
        const dy = localMouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = mouse.active ? Math.max(0, 1 - dist / 220) : 0;
        const boostedAlpha = Math.min(1, baseAlpha + proximity * 0.7);
        const boostedSize = (this.size * scale) * (1 + proximity * 2.5);

        context.globalAlpha = boostedAlpha;

        if (proximity > 0.3) {
          // Glowing dot near cursor
          const gradient = context.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, boostedSize * 3
          );
          gradient.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},1)`);
          gradient.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
          context.fillStyle = gradient;
          context.beginPath();
          context.arc(this.x, this.y, boostedSize * 3, 0, Math.PI * 2);
          context.fill();
        } else {
          // Normal small square
          context.fillStyle = color;
          context.fillRect(this.x, this.y, boostedSize, boostedSize);
        }
      }
    }

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      particles.forEach((p) => { p.update(); p.draw(ctx); });
      animationFrameId = requestAnimationFrame(animate);
    };

    // === GLOBAL mouse tracking — bypasses pointer-events-none ===
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      init();
    };

    init();
    animate();

    // Attach to WINDOW so pointer-events-none doesn't block it
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, trailOpacity, particleCount, speed, scale]);

  return (
    <div ref={containerRef} className={cn("relative w-full h-full overflow-hidden", className)}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
