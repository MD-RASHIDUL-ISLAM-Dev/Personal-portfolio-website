(() => {
  const root = document.documentElement;
  const safeReveal = () => {
    root.classList.add('startup-safe');
    document.querySelectorAll('.reveal-item,.motion-card,.motion-rise').forEach(node => {
      node.classList.add('is-visible', 'is-motion-visible');
      node.style.opacity = '1';
      node.style.visibility = 'visible';
      node.style.transform = 'none';
      node.style.clipPath = 'none';
    });
    const loader = document.querySelector('.page-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      loader.style.pointerEvents = 'none';
    }
  };
  const recoverMenu = () => {
    const toggle = document.querySelector('#menu-toggle');
    const menu = document.querySelector('#site-menu');
    if (!toggle || !menu || window.__rifatMenuBound) return;
    window.__rifatMenuBound = true;
    toggle.addEventListener('click', () => {
      const open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      toggle.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  };
  const run = () => { safeReveal(); recoverMenu(); };
  window.addEventListener('error', run, { once: true });
  window.addEventListener('unhandledrejection', run, { once: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  window.setTimeout(run, 900);
})();
