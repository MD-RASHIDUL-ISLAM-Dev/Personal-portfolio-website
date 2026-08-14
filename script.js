(() => {
  'use strict';

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const lowPowerMode = reducedMotion || saveData;
  const finePointer = window.matchMedia('(pointer:fine)').matches && window.matchMedia('(hover:hover)').matches;
  const coarsePointer = window.matchMedia('(pointer:coarse)').matches;

  /* Shared pointer state */
  const pointer = { x: -1000, y: -1000, active: false };
  let pointerRaf = 0;
  const pointerTargets = { x: -1000, y: -1000 };

  /* Liquid-glass navigation, mobile menu and scroll state */
  const nav = $('#site-nav');
  const menuToggle = $('#menu-toggle');
  const siteMenu = $('#site-menu');
  const closeMenu = () => {
    if (!menuToggle || !siteMenu) return;
    menuToggle.classList.remove('is-open');
    siteMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  };
  if (menuToggle && siteMenu) {
    menuToggle.addEventListener('click', () => {
      const open = !siteMenu.classList.contains('is-open');
      siteMenu.classList.toggle('is-open', open);
      menuToggle.classList.toggle('is-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('.site-nav__links a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  }

  const progress = $('#scroll-progress');
  const sticky = $('#mobile-sticky-cta');
  let scrollTicking = false;
  const updateScrollUI = () => {
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle('is-scrolled', scrollTop > 24);
    if (progress) progress.style.width = `${scrollable > 0 ? (scrollTop / scrollable) * 100 : 0}%`;
    if (sticky && window.innerWidth <= 760) sticky.classList.toggle('is-revealed', scrollTop > 420 && scrollTop < document.documentElement.scrollHeight - window.innerHeight - 260);
    scrollTicking = false;
  };
  const requestScrollUI = () => { if (!scrollTicking) { scrollTicking = true; window.requestAnimationFrame(updateScrollUI); } };
  updateScrollUI();
  window.addEventListener('scroll', requestScrollUI, { passive: true });
  window.addEventListener('resize', requestScrollUI, { passive: true });

  /* Reference-style dust and interactive physics constellation */
  const dustCanvas = $('#dust-layer');
  const constellationCanvas = $('#constellation-layer');
  const dustParticles = [];
  const constellationParticles = [];
  let dustContext;
  let constellationContext;
  let dustFrame = 0;
  let constellationFrame = 0;
  let lastConstellationTime = 0;
  const configureCanvas = (canvas, contextName) => {
    if (!canvas) return null;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.7);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const context = canvas.getContext('2d');
    if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
    return context;
  };
  const setupDust = () => {
    if (!dustCanvas || lowPowerMode) return;
    dustContext = configureCanvas(dustCanvas, 'dust');
    dustParticles.length = 0;
    const count = Math.min(92, Math.max(38, Math.floor(window.innerWidth / 16)));
    for (let index = 0; index < count; index += 1) {
      dustParticles.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, vx: (Math.random() - .5) * .055, vy: -(Math.random() * .11 + .025), radius: Math.random() * 1.35 + .35, opacity: Math.random() * .38 + .1, phase: Math.random() * Math.PI * 2 });
    }
  };
  const setupConstellation = () => {
    if (!constellationCanvas || lowPowerMode) return;
    constellationContext = configureCanvas(constellationCanvas, 'constellation');
    constellationParticles.length = 0;
    const count = Math.min(86, Math.max(34, Math.floor(window.innerWidth / 15)));
    for (let index = 0; index < count; index += 1) {
      constellationParticles.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .08, radius: Math.random() * 1.5 + .45, phase: Math.random() * Math.PI * 2 });
    }
  };
  const drawDust = (time = 0) => {
    if (!dustContext || document.hidden) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    dustContext.clearRect(0, 0, width, height);
    dustParticles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.y < -5) particle.y = height + 5;
      if (particle.x < -5) particle.x = width + 5;
      if (particle.x > width + 5) particle.x = -5;
      const pulse = .72 + Math.sin(time * .00055 + particle.phase) * .28;
      const pointerDistance = Math.hypot(particle.x - pointer.x, particle.y - pointer.y);
      const lift = pointer.active && pointerDistance < 150 ? (1 - pointerDistance / 150) * .5 : 0;
      dustContext.beginPath();
      dustContext.fillStyle = `rgba(241,218,138,${(particle.opacity + lift) * pulse})`;
      dustContext.arc(particle.x, particle.y, particle.radius + lift, 0, Math.PI * 2);
      dustContext.fill();
      const neighbor = dustParticles[(index + 9) % dustParticles.length];
      if (neighbor && Math.abs(neighbor.x - particle.x) < 126 && Math.abs(neighbor.y - particle.y) < 92) {
        dustContext.beginPath();
        dustContext.strokeStyle = 'rgba(145,168,231,.075)';
        dustContext.lineWidth = .6;
        dustContext.moveTo(particle.x, particle.y);
        dustContext.lineTo(neighbor.x, neighbor.y);
        dustContext.stroke();
      }
    });
    dustFrame = window.requestAnimationFrame(drawDust);
  };
  const drawConstellation = (time = 0) => {
    if (!constellationContext || document.hidden) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const delta = Math.min((time - lastConstellationTime) || 16, 32) / 16;
    lastConstellationTime = time;
    constellationContext.clearRect(0, 0, width, height);
    const nebula = constellationContext.createRadialGradient(width * .7, height * .18, 0, width * .7, height * .18, Math.max(width, height) * .62);
    nebula.addColorStop(0, 'rgba(34,73,147,.11)');
    nebula.addColorStop(.46, 'rgba(20,34,76,.035)');
    nebula.addColorStop(1, 'rgba(0,0,0,0)');
    constellationContext.fillStyle = nebula;
    constellationContext.fillRect(0, 0, width, height);
    constellationParticles.forEach(particle => {
      if (!coarsePointer && pointer.active) {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distance = Math.max(20, Math.hypot(dx, dy));
        if (distance < 250) {
          const force = (1 - distance / 250) * .0009;
          particle.vx += dx * force * delta;
          particle.vy += dy * force * delta;
        }
      }
      particle.vx *= .994;
      particle.vy *= .994;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;
    });
    for (let index = 0; index < constellationParticles.length; index += 1) {
      const particle = constellationParticles[index];
      let links = 0;
      for (let next = index + 1; next < constellationParticles.length && links < 4; next += 1) {
        const neighbor = constellationParticles[next];
        const distance = Math.hypot(neighbor.x - particle.x, neighbor.y - particle.y);
        if (distance < 145) {
          const brightness = (1 - distance / 145) * .17;
          constellationContext.beginPath();
          constellationContext.strokeStyle = `rgba(108,166,255,${brightness})`;
          constellationContext.lineWidth = distance < 76 ? 1 : .55;
          constellationContext.moveTo(particle.x, particle.y);
          constellationContext.lineTo(neighbor.x, neighbor.y);
          constellationContext.stroke();
          links += 1;
        }
      }
      if (!coarsePointer && pointer.active) {
        const distance = Math.hypot(pointer.x - particle.x, pointer.y - particle.y);
        if (distance < 220) {
          constellationContext.beginPath();
          constellationContext.strokeStyle = `rgba(98,233,255,${(1 - distance / 220) * .46})`;
          constellationContext.lineWidth = 1;
          constellationContext.moveTo(pointer.x, pointer.y);
          constellationContext.lineTo(particle.x, particle.y);
          constellationContext.stroke();
        }
      }
      const pulse = .72 + Math.sin(time * .0007 + particle.phase) * .28;
      constellationContext.beginPath();
      constellationContext.fillStyle = `rgba(153,194,255,${.25 + pulse * .34})`;
      constellationContext.arc(particle.x, particle.y, particle.radius + pulse * .35, 0, Math.PI * 2);
      constellationContext.fill();
    }
    constellationFrame = window.requestAnimationFrame(drawConstellation);
  };
  const restartCanvases = () => {
    if (dustFrame) window.cancelAnimationFrame(dustFrame);
    if (constellationFrame) window.cancelAnimationFrame(constellationFrame);
    setupDust();
    setupConstellation();
    if (!lowPowerMode) {
      dustFrame = window.requestAnimationFrame(drawDust);
      constellationFrame = window.requestAnimationFrame(drawConstellation);
    }
  };
  restartCanvases();
  window.addEventListener('resize', restartCanvases, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (dustFrame) window.cancelAnimationFrame(dustFrame);
      if (constellationFrame) window.cancelAnimationFrame(constellationFrame);
    } else if (!lowPowerMode) {
      dustFrame = window.requestAnimationFrame(drawDust);
      constellationFrame = window.requestAnimationFrame(drawConstellation);
    }
  });
  document.addEventListener('pointermove', event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    pointerTargets.x = event.clientX;
    pointerTargets.y = event.clientY;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });

  /* Hero perspective response; the approved original portrait remains static */
  const heroVisual = $('#hero-visual');
  if (heroVisual && !lowPowerMode && finePointer) {
    heroVisual.addEventListener('pointermove', event => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      const plate = heroVisual.querySelector('.portrait-plate');
      if (plate && !plate.classList.contains('portrait-plate--original')) plate.style.setProperty('transform', `perspective(1100px) rotateY(${x * -5}deg) rotateX(${y * 3}deg) translateY(-2px)`);
    });
    heroVisual.addEventListener('pointerleave', () => {
      const plate = heroVisual.querySelector('.portrait-plate');
      if (plate && !plate.classList.contains('portrait-plate--original')) plate.style.setProperty('transform', 'perspective(1100px) rotateY(-3deg) rotateX(0deg)');
    });
  }

  /* Project rail updates the promise and linked deployment, never the approved portrait */
  const heroPromise = $('#hero-promise');
  const heroProjectLabel = $('#hero-project-label');
  const heroProjectLink = $('#hero-project-link');
  const projects = {
    archive: { label: 'MRI PDF Archive Vault · Live Bot', promise: 'You will learn to turn a messy document library into a searchable system.', href: 'https://t.me/MRI_PDF_ARCHIVE_Bot', art: 'assets/project-mri-vault-relatable.webp', name: 'MRI PDF Archive Vault', tag: 'DOCUMENT SYSTEMS', kicker: 'Deployment portrait' },
    deepseek: { label: 'DeepSeek Telegram AI Bot · Conversational AI', promise: 'You will learn to connect a powerful model to a focused user experience.', href: '#projects', art: 'assets/project-deepseek-telegram-relatable.webp', name: 'DeepSeek Telegram AI Bot', tag: 'CONVERSATIONAL AI', kicker: 'System portrait' },
    portfolio: { label: 'Personal Portfolio Website · Live Demo', promise: 'You will learn to make technical work feel clear, calm, and memorable.', href: 'https://www.mdrashidulislam.kdns.fr/', art: 'assets/project-portfolio-relatable.webp', name: 'Personal Portfolio Website', tag: 'FRONTEND SYSTEMS', kicker: 'Interface portrait' },
  };
  $$('.rail-card').forEach(card => {
    card.addEventListener('click', () => {
      const data = projects[card.dataset.project];
      if (!data) return;
      $$('.rail-card').forEach(item => item.classList.remove('is-active'));
      card.classList.add('is-active');
      if (heroPromise) heroPromise.textContent = data.promise;
      if (heroProjectLabel) heroProjectLabel.textContent = data.label;
      if (heroProjectLink) {
        heroProjectLink.href = data.href;
        if (data.href.startsWith('http')) { heroProjectLink.target = '_blank'; heroProjectLink.rel = 'noopener'; } else { heroProjectLink.removeAttribute('target'); heroProjectLink.removeAttribute('rel'); }
      }
    });
  });

  /* Accessible six-mode library */
  const tabs = $$('.showcase-tab');
  const panels = $$('.showcase-panel');
  const activateTab = (tab, shouldFocus = false) => {
    const id = tab.dataset.tab;
    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      if (!item.id) item.id = `tab-${item.dataset.tab}`;
    });
    panels.forEach(panel => {
      const active = panel.dataset.panel === id;
      panel.hidden = !active;
      if (active) panel.setAttribute('aria-labelledby', tab.id);
    });
    if (shouldFocus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.id = tab.id || `tab-${tab.dataset.tab}`;
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      if (next !== index) { event.preventDefault(); activateTab(tabs[next], true); }
    });
  });

  /* Scroll reveal */
  const revealItems = $$('.reveal-item');
  if ('IntersectionObserver' in window && !lowPowerMode) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: '0px 0px -45px' });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('is-visible'));

  /* Project visual preview dialog */
  const dialog = $('#project-dialog');
  const dialogImage = $('#dialog-image');
  const dialogKicker = $('#dialog-kicker');
  const dialogTitle = $('#dialog-title');
  const dialogCopy = $('#dialog-copy');
  const dialogLinks = $('#dialog-links');
  const dialogProblem = $('#dialog-problem');
  const dialogBuild = $('#dialog-build');
  const dialogOutcome = $('#dialog-outcome');
  const dialogProof = $('#dialog-proof');
  let lastDialogTrigger = null;
  const dialogData = {
    archive: { ...projects.archive, kicker: 'Telegram · Python · SQLite', copy: 'Telegram-based PDF storage and retrieval with smart categorization, fuzzy search, reading progress tracking, and automated backups running on Termux.', problem: 'Make a growing document library easier to search, retrieve and keep organized.', build: 'Telegram bot, SQLite data structure, fuzzy search, reading progress and backup workflows.', outcome: 'A focused document workflow that can be used directly inside Telegram.', proof: 'Live bot and public source code.', links: [['Live Bot ↗', 'https://t.me/MRI_PDF_ARCHIVE_Bot'], ['Source Code ↗', 'https://github.com/MD-RASHIDUL-ISLAM-Dev/ri-pdf-vault-bot']] },
    deepseek: { ...projects.deepseek, kicker: 'DeepSeek · OpenRouter · Telegram', copy: 'A conversational Telegram chatbot integrating DeepSeek R1 through OpenRouter API for real-time AI conversations inside Telegram.', problem: 'Bring a capable language model into a familiar, focused chat experience.', build: 'Telegram conversation flow, OpenRouter API integration and DeepSeek R1 model routing.', outcome: 'A practical conversational AI direction designed for real-time use inside Telegram.', proof: 'Active build plan; source release follows completion.', links: [] },
    portfolio: { ...projects.portfolio, kicker: 'HTML5 · CSS3 · Vanilla JavaScript', copy: 'A single-page portfolio experience with a custom editorial layout, interactive project rail, animated constellation field, responsive navigation, tabbed capabilities, filters, and thoughtful motion built without a framework.', problem: 'Present technical work with enough clarity and personality to be memorable.', build: 'Semantic HTML, custom CSS, vanilla JavaScript interactions, responsive layouts and local artwork.', outcome: 'A polished personal brand interface that explains the work and creates a direct path to contact.', proof: 'Live interface and public source code.', links: [['Live Demo ↗', 'https://www.mdrashidulislam.kdns.fr/'], ['Source Code ↗', 'https://github.com/MD-RASHIDUL-ISLAM-Dev/Personal-portfolio-website']] },
  };
  const openPreview = key => {
    const data = dialogData[key];
    if (!data || !dialog) return;
    dialogImage.src = data.art;
    dialogImage.alt = `${data.name} project artwork`;
    dialogKicker.textContent = data.kicker;
    dialogTitle.textContent = data.name;
    dialogCopy.textContent = data.copy;
    if (dialogProblem) dialogProblem.textContent = data.problem;
    if (dialogBuild) dialogBuild.textContent = data.build;
    if (dialogOutcome) dialogOutcome.textContent = data.outcome;
    if (dialogProof) dialogProof.textContent = data.proof;
    dialogLinks.innerHTML = data.links.length ? data.links.map(([label, href]) => `<a href="${href}" target="_blank" rel="noopener">${label}</a>`).join('') : '<span class="is-muted">Source code coming soon</span>';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    window.setTimeout(() => $('#dialog-close')?.focus(), 0);
  };
  $$('[data-preview]').forEach(button => button.addEventListener('click', () => { lastDialogTrigger = button; openPreview(button.dataset.preview); }));
  const closeDialog = () => { if (!dialog) return; dialog.close(); lastDialogTrigger?.focus(); };
  $('#dialog-close')?.addEventListener('click', closeDialog);
  dialog?.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
  dialog?.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = $$('button, a[href], [tabindex]:not([tabindex="-1"])', dialog).filter(item => !item.hasAttribute('disabled') && item.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  dialog?.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });

  /* Project and technical-stack filtering without a reload */
  const applyFilter = (buttons, items, attribute, value) => {
    buttons.forEach(button => {
      const active = button.dataset[attribute] === value;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    items.forEach(item => {
      const matches = value === 'all' || item.dataset[attribute.replace('filter', 'categories') || 'categories']?.split(' ').includes(value);
      item.classList.remove('is-filter-entering');
      if (matches) {
        item.hidden = false;
        window.requestAnimationFrame(() => item.classList.add('is-filter-entering'));
      } else {
        item.hidden = true;
      }
    });
  };
  const projectFilterButtons = $$('[data-filter]');
  const projectCards = $$('[data-project-card]');
  projectFilterButtons.forEach(button => button.addEventListener('click', () => {
    const value = button.dataset.filter;
    projectFilterButtons.forEach(item => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', String(active)); });
    projectCards.forEach(card => {
      const matches = value === 'all' || card.dataset.categories.split(' ').includes(value);
      card.hidden = !matches;
      card.classList.toggle('is-filter-entering', matches);
    });
  }));
  const skillFilterButtons = $$('[data-skill-filter]');
  const skillCards = $$('[data-skill-category]');
  skillFilterButtons.forEach(button => button.addEventListener('click', () => {
    const value = button.dataset.skillFilter;
    skillFilterButtons.forEach(item => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', String(active)); });
    skillCards.forEach(card => { const matches = value === 'all' || card.dataset.skillCategory === value; card.hidden = !matches; card.classList.toggle('is-filter-entering', matches); });
  }));

  /* Terminal typist engines */
  const typeLoop = (element, phrases, speed = 54, pause = 1500) => {
    if (!element) return;
    if (lowPowerMode) { element.textContent = phrases[0]; return; }
    let phraseIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    const tick = () => {
      const phrase = phrases[phraseIndex];
      element.textContent = deleting ? phrase.slice(0, Math.max(0, characterIndex - 1)) : phrase.slice(0, characterIndex + 1);
      characterIndex += deleting ? -1 : 1;
      let delay = deleting ? Math.max(18, speed * .56) : speed;
      if (!deleting && characterIndex >= phrase.length) { deleting = true; delay = pause; }
      if (deleting && characterIndex <= 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 320; }
      window.setTimeout(tick, delay);
    };
    tick();
  };
  typeLoop($('#terminal-typing'), ['init portfolio --interactive', 'map systems --human', 'ship useful software'], 48, 1350);
  typeLoop($('#profile-typing'), ['status: ready_for_collaboration', 'stack: python + llm + web', 'mode: build_with_intent'], 42, 1600);

  /* 3D spotlight cards and magnetic controls */
  const tiltable = $$('.project-card,.skill-card,.process-step,.bio-principles article,.showcase-panel,.hero-signal__card,.service-card');
  tiltable.forEach(card => {
    card.classList.add('spotlight-card');
    if (!lowPowerMode && finePointer) card.classList.add('is-tiltable');
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--spot-x', `${x}%`);
      card.style.setProperty('--spot-y', `${y}%`);
      card.classList.add('is-spotlit');
      if (!lowPowerMode && finePointer) {
        const rotateX = ((event.clientY - rect.top) / rect.height - .5) * -5;
        const rotateY = ((event.clientX - rect.left) / rect.width - .5) * 6;
        card.classList.add('is-tilting');
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      }
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-spotlit', 'is-tilting');
      card.style.removeProperty('transform');
    });
  });
  const magneticTargets = $$('.gold-button,.nav-cta,.dialog-close,.project-preview,.filter-chip,.skill-chip,.menu-toggle');
  magneticTargets.forEach(button => {
    button.classList.add('is-magnetic');
    if (lowPowerMode || !finePointer) return;
    button.addEventListener('pointermove', event => {
      const rect = button.getBoundingClientRect();
      const dx = Math.max(-7, Math.min(7, (event.clientX - (rect.left + rect.width / 2)) * .18));
      const dy = Math.max(-5, Math.min(5, (event.clientY - (rect.top + rect.height / 2)) * .18));
      button.classList.add('is-magnetized');
      button.style.transform = `translate(${dx}px,${dy}px)`;
    });
    button.addEventListener('pointerleave', () => { button.classList.remove('is-magnetized'); button.style.removeProperty('transform'); });
  });

  /* Custom neon cursor and click ripples for desktop pointers */
  const cursorDot = $('#cursor-dot');
  const cursorRing = $('#cursor-ring');
  if (finePointer && !lowPowerMode && cursorDot && cursorRing) {
    document.body.classList.add('has-custom-cursor');
    let ringX = -1000;
    let ringY = -1000;
    const animateCursor = () => {
      ringX += (pointerTargets.x - ringX) * .18;
      ringY += (pointerTargets.y - ringY) * .18;
      cursorDot.style.left = `${pointerTargets.x}px`;
      cursorDot.style.top = `${pointerTargets.y}px`;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      cursorDot.style.opacity = pointer.active ? '1' : '0';
      cursorRing.style.opacity = pointer.active ? '1' : '0';
      pointerRaf = window.requestAnimationFrame(animateCursor);
    };
    pointerRaf = window.requestAnimationFrame(animateCursor);
    document.addEventListener('pointerover', event => {
      const target = event.target.closest('a,button,.project-card,.skill-card,.tab-row');
      if (target) cursorRing.classList.add('is-hovering');
    });
    document.addEventListener('pointerout', event => { if (!event.relatedTarget || !event.relatedTarget.closest('a,button,.project-card,.skill-card,.tab-row')) cursorRing.classList.remove('is-hovering'); });
    document.addEventListener('pointerdown', event => {
      const target = event.target.closest('a,button,.project-card,.skill-card');
      if (!target) return;
      const ripple = document.createElement('span');
      ripple.className = 'cursor-ripple';
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      document.body.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 760);
      }, { passive: true });
  }

  /* Native FAQ behavior: keep the reading surface calm by closing other open items */
  $$('.faq-item').forEach(item => item.addEventListener('toggle', () => {
    if (!item.open) return;
    $$('.faq-item').filter(other => other !== item && other.open).forEach(other => { other.open = false; });
  }));

  /* Front-end-only mailto form */
  const contactForm = $('#contact-form');
  const formStatus = $('#form-status');
  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const subject = String(data.get('subject') || '').trim();
    const message = String(data.get('message') || '').trim();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    if (formStatus) formStatus.textContent = 'Opening your email client…';
    window.location.href = `mailto:rashidulislamrifat14708@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.setTimeout(() => { if (formStatus) formStatus.textContent = 'If your email client did not open, write directly to rashidulislamrifat14708@gmail.com.'; }, 1800);
  });

  $$('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
    const email = button.dataset.copyEmail || 'rashidulislamrifat14708@gmail.com';
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(email);
      else { const helper = document.createElement('textarea'); helper.value = email; document.body.appendChild(helper); helper.select(); document.execCommand('copy'); helper.remove(); }
      const original = button.innerHTML;
      button.innerHTML = '<span>✓</span> Email copied';
      window.setTimeout(() => { button.innerHTML = original; }, 2200);
    } catch (error) {
      window.location.href = `mailto:${email}`;
    }
  }));

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
