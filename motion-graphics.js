(() => {
  'use strict';
  try {
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = Boolean(navigator.connection?.saveData);
    const desktop = window.matchMedia('(min-width: 900px)').matches;
    root.classList.add('motion-graphics-ready');
    if (reduced || saveData) {
      root.classList.add('motion-graphics-reduced');
      return;
    }

    // Mobile receives CSS-only ambient motion; no canvas or pointer loop is created.
    if (!desktop) {
      root.classList.add('motion-graphics-mobile');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'ambient-motion-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('role', 'presentation');
    document.body.appendChild(canvas);
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const pointer = { x: -1000, y: -1000, active: false };
    const particles = [];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frame = 0;
    let lastFrame = 0;
    let visible = document.visibilityState === 'visible';

    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const seed = () => {
      particles.length = 0;
      const count = Math.min(28, Math.max(14, Math.round(width / 48)));
      for (let index = 0; index < count; index += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          radius: 0.7 + Math.random() * 1.7,
          phase: Math.random() * Math.PI * 2
        });
      }
    };

    const draw = timestamp => {
      frame = window.requestAnimationFrame(draw);
      if (!visible || timestamp - lastFrame < 42) return; // about 24fps, intentionally lightweight
      lastFrame = timestamp;
      context.clearRect(0, 0, width, height);
      const time = timestamp * 0.00025;
      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;
        const pulse = 0.45 + (Math.sin(time + particle.phase) + 1) * 0.2;
        context.beginPath();
        context.fillStyle = `rgba(236, 204, 116, ${pulse * 0.42})`;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
      for (let first = 0; first < particles.length; first += 1) {
        for (let second = first + 1; second < particles.length; second += 1) {
          const a = particles[first];
          const b = particles[second];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 150) continue;
          const alpha = (1 - distance / 150) * 0.13;
          context.beginPath();
          context.strokeStyle = `rgba(140, 187, 214, ${alpha})`;
          context.lineWidth = 0.7;
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
      if (pointer.active) {
        for (const particle of particles) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 170) continue;
          context.beginPath();
          context.strokeStyle = `rgba(236, 204, 116, ${(1 - distance / 170) * 0.18})`;
          context.lineWidth = 0.8;
          context.moveTo(pointer.x, pointer.y);
          context.lineTo(particle.x, particle.y);
          context.stroke();
        }
      }
    };

    resize();
    seed();
    window.addEventListener('resize', () => { resize(); seed(); }, { passive: true });
    document.addEventListener('visibilitychange', () => { visible = document.visibilityState === 'visible'; }, { passive: true });
    document.addEventListener('pointermove', event => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
    frame = window.requestAnimationFrame(draw);
    window.addEventListener('pagehide', () => window.cancelAnimationFrame(frame), { once: true, passive: true });
  } catch (error) {
    // Decorative motion must never affect page loading or interaction.
    document.documentElement.classList.add('motion-graphics-fallback');
  }
})();
