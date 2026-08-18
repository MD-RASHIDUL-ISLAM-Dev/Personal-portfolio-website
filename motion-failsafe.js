(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || Boolean(navigator.connection?.saveData) || root.dataset.view === 'simple';
  const selector = '.motion-rise,.motion-card,.reveal-item';
  const collect = () => [...document.querySelectorAll(selector)];
  const reveal = target => {
    target.classList.add('is-motion-visible', 'is-visible');
    target.style.removeProperty('opacity');
    target.style.removeProperty('transform');
    target.style.removeProperty('clip-path');
  };
  const revealVisible = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    collect().forEach(target => {
      const rect = target.getBoundingClientRect();
      if (reduced || (rect.top < viewportHeight * 1.08 && rect.bottom > -120)) reveal(target);
    });
  };
  const revealAllIfStillHidden = () => {
    collect().forEach(target => {
      const style = getComputedStyle(target);
      if (style.visibility !== 'hidden' && parseFloat(style.opacity) < 0.02) reveal(target);
    });
  };

  revealVisible();
  window.addEventListener('scroll', revealVisible, { passive: true });
  window.addEventListener('resize', revealVisible, { passive: true });
  window.addEventListener('pageshow', () => { revealVisible(); window.setTimeout(revealAllIfStillHidden, 260); }, { passive: true });
  window.setTimeout(revealVisible, 180);
  window.setTimeout(revealAllIfStillHidden, 900);

  // Motion initializers may add classes in a later isolated script block.
  // Watch class mutations briefly so cached/hash/mobile navigation cannot strand cards at opacity:0.
  if (document.body && window.MutationObserver) {
    const observer = new MutationObserver(() => {
      if (collect().length) revealVisible();
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
    window.setTimeout(() => observer.disconnect(), 2200);
  }
})();
