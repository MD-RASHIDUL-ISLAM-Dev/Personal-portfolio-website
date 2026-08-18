(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const simpleView = root.dataset.view === 'simple';
  if (reducedMotion || !finePointer || simpleView) return;

  const targets = [...document.querySelectorAll('.project-card,.service-card,.proof-ledger-card,.proof-demo-card,.proof-decision-card,.client-portal-panel,.availability-card,.gold-button,.nav-cta')];
  if (!targets.length) return;

  const targetLabel = target => {
    if (target.matches('.gold-button,.nav-cta')) return root.dataset.language === 'bn' ? 'CTA / পরবর্তী ধাপ' : 'CTA / NEXT';
    if (target.matches('.client-portal-panel,.availability-card')) return root.dataset.language === 'bn' ? 'ডেলিভারি / প্রস্তুত' : 'DELIVERY / READY';
    if (target.matches('.proof-ledger-card,.proof-demo-card,.proof-decision-card')) return root.dataset.language === 'bn' ? 'প্রমাণ / ট্রেস' : 'PROOF / TRACE';
    if (target.matches('.service-card')) return root.dataset.language === 'bn' ? 'সেবা / শিপ' : 'SERVICE / SHIP';
    return root.dataset.language === 'bn' ? 'প্রজেক্ট / প্রমাণ' : 'PROJECT / PROOF';
  };

  const layer = document.createElement('div');
  layer.className = 'proof-flow-layer';
  layer.id = 'proof-flow-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<canvas></canvas><span class="proof-flow-caption"></span>';
  document.body.appendChild(layer);
  const canvas = layer.querySelector('canvas');
  const caption = layer.querySelector('.proof-flow-caption');
  const context = canvas?.getContext('2d');
  if (!context || !caption) return;

  let dpr = 1;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let pointer = { x: width * .5, y: height * .35, active: false };
  let activeTarget = null;
  let frame = 0;
  let leaveTimer = 0;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const clearTarget = target => {
    target?.classList.remove('is-proof-flow-active');
    target?.removeAttribute('data-proof-flow-label');
  };
  const setTarget = target => {
    if (activeTarget && activeTarget !== target) clearTarget(activeTarget);
    window.clearTimeout(leaveTimer);
    activeTarget = target;
    target.classList.add('is-proof-flow-active');
    target.dataset.proofFlowLabel = targetLabel(target);
    caption.textContent = target.dataset.proofFlowLabel;
    caption.classList.add('is-visible');
  };
  const leaveTarget = target => {
    leaveTimer = window.setTimeout(() => {
      if (activeTarget === target) {
        clearTarget(target);
        activeTarget = null;
        caption.classList.remove('is-visible');
      }
    }, 90);
  };
  const pointOnCurve = (start, control, end, progress) => {
    const inverse = 1 - progress;
    return { x: inverse * inverse * start.x + 2 * inverse * progress * control.x + progress * progress * end.x, y: inverse * inverse * start.y + 2 * inverse * progress * control.y + progress * progress * end.y };
  };
  const draw = time => {
    context.clearRect(0, 0, width, height);
    if (pointer.active && activeTarget?.isConnected) {
      const rect = activeTarget.getBoundingClientRect();
      const end = { x: rect.left + rect.width * .5, y: rect.top + Math.min(rect.height * .3, 130) };
      const dx = end.x - pointer.x;
      const dy = end.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < Math.max(width * 1.35, 900)) {
        const control = { x: pointer.x + dx * .48 + Math.sin(time * .0011) * 18, y: pointer.y + dy * .48 - Math.cos(time * .001) * 14 };
        const gradient = context.createLinearGradient(pointer.x, pointer.y, end.x, end.y);
        gradient.addColorStop(0, 'rgba(98,233,255,.08)');
        gradient.addColorStop(.45, 'rgba(98,233,255,.72)');
        gradient.addColorStop(1, 'rgba(241,218,138,.9)');
        context.beginPath();
        context.moveTo(pointer.x, pointer.y);
        context.quadraticCurveTo(control.x, control.y, end.x, end.y);
        context.setLineDash([3, 8]);
        context.lineDashOffset = -time * .018;
        context.lineWidth = 1;
        context.strokeStyle = gradient;
        context.stroke();
        context.setLineDash([]);
        const pulse = pointOnCurve(pointer, control, end, ((time % 1500) / 1500));
        context.beginPath();
        context.arc(pulse.x, pulse.y, 2.5 + Math.sin(time * .008) * .8, 0, Math.PI * 2);
        context.fillStyle = 'rgba(241,218,138,.95)';
        context.shadowBlur = 14;
        context.shadowColor = 'rgba(241,218,138,.8)';
        context.fill();
        context.shadowBlur = 0;
        context.beginPath();
        context.arc(end.x, end.y, 5 + Math.sin(time * .004) * 1.5, 0, Math.PI * 2);
        context.strokeStyle = 'rgba(241,218,138,.75)';
        context.stroke();
        const captionLeft = Math.max(10, Math.min(width - caption.offsetWidth - 10, end.x + 14));
        const captionTop = Math.max(12, Math.min(height - 38, end.y - 24));
        caption.style.transform = `translate3d(${captionLeft}px,${captionTop}px,0)`;
      }
    }
    frame = window.requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('pointermove', event => { pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true; }, { passive: true });
  targets.forEach(target => {
    target.addEventListener('pointerenter', () => setTarget(target));
    target.addEventListener('pointerleave', () => leaveTarget(target));
    target.addEventListener('focusin', () => setTarget(target));
    target.addEventListener('focusout', () => leaveTarget(target));
  });
  frame = window.requestAnimationFrame(draw);
  window.addEventListener('pagehide', () => window.cancelAnimationFrame(frame), { once: true });
})();
