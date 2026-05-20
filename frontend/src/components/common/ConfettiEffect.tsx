import React, { useEffect, useRef } from 'react';

interface ConfettiEffectProps {
  active: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  scaleY: number;
  wobble: number;
  wobbleSpeed: number;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ active, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = [
      '#10b981', // Jade/Emerald
      '#059669', // Deep Emerald
      '#34d399', // Light Emerald
      '#fbbf24', // Amber/Gold
      '#f59e0b', // Warm Gold
      '#22d3ee', // Cyan
      '#06b6d4', // Teal/Cyan
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
    ];

    const particles: Particle[] = [];
    const particleCount = 150;

    // Initialize particles from the center/bottom or scattered from two sides
    const initParticles = () => {
      // Left and right bursts
      for (let i = 0; i < particleCount; i++) {
        const isLeft = i % 2 === 0;
        const x = isLeft ? 0 : canvas.width;
        const y = canvas.height * 0.75;
        
        // Launch angle: upwards and inwards
        const angle = isLeft 
          ? (Math.random() * 45 - 60) * (Math.PI / 180) // -15 to -60 degrees
          : (Math.random() * 45 - 120) * (Math.PI / 180); // -120 to -165 degrees
          
        const speed = Math.random() * 15 + 15; // Velocity magnitude

        particles.push({
          x,
          y,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle',
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 8,
          opacity: 1,
          scaleY: 1,
          wobble: Math.random() * 10,
          wobbleSpeed: Math.random() * 0.1 + 0.05
        });
      }
    };

    initParticles();

    let animationFrameId: number;
    const gravity = 0.4;
    const friction = 0.98;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeParticles = 0;

      particles.forEach((p) => {
        // Physics update
        p.vx *= friction;
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;
        p.scaleY = Math.sin(p.wobble);

        // Fade out as it goes down or after some time
        if (p.y > canvas.height * 0.6) {
          p.opacity -= 0.015;
        }

        if (p.opacity > 0) {
          activeParticles++;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.scale(1, p.scaleY);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          ctx.beginPath();
          if (p.shape === 'circle') {
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'square') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else if (p.shape === 'triangle') {
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(p.size / 2, p.size / 2);
            ctx.lineTo(-p.size / 2, p.size / 2);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
      });

      if (activeParticles > 0) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none w-full h-full"
    />
  );
};
