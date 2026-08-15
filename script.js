(() => {
  'use strict';

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const lowPowerMode = reducedMotion || saveData;
  const isBn = () => document.documentElement.dataset.language === 'bn';
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
    archive: { label: 'MRI PDF Archive Vault · Live Bot', bnLabel: 'MRI PDF Archive Vault · Live Bot', promise: 'You will learn to turn a messy document library into a searchable system.', bnPromise: 'জটিল document library-কে searchable system-এ রূপ দিতে শিখবেন।', href: 'https://t.me/MRI_PDF_ARCHIVE_Bot', art: 'project-mri-vault-relatable.webp', name: 'MRI PDF Archive Vault', tag: 'DOCUMENT SYSTEMS', kicker: 'Deployment portrait' },
    deepseek: { label: 'DeepSeek Telegram AI Bot · Conversational AI', bnLabel: 'DeepSeek Telegram AI Bot · Conversational AI', promise: 'You will learn to connect a powerful model to a focused user experience.', bnPromise: 'একটি powerful model-কে focused user experience-এর সঙ্গে connect করার পদ্ধতি দেখবেন।', href: '#projects', art: 'project-deepseek-telegram-relatable.webp', name: 'DeepSeek Telegram AI Bot', tag: 'CONVERSATIONAL AI', kicker: 'System portrait' },
    portfolio: { label: 'Personal Portfolio Website · Live Demo', bnLabel: 'Personal Portfolio Website · Live Demo', promise: 'You will learn to make technical work feel clear, calm, and memorable.', bnPromise: 'technical কাজকে clear, calm ও memorable করার পদ্ধতি দেখবেন।', href: 'https://www.mdrashidulislam.kdns.fr/', art: 'project-portfolio-relatable.webp', name: 'Personal Portfolio Website', tag: 'FRONTEND SYSTEMS', kicker: 'Interface portrait' },
  };
  $$('.rail-card').forEach(card => {
    card.addEventListener('click', () => {
      const data = projects[card.dataset.project];
      if (!data) return;
      $$('.rail-card').forEach(item => item.classList.remove('is-active'));
      card.classList.add('is-active');
      if (heroPromise) heroPromise.textContent = isBn() ? data.bnPromise : data.promise;
      if (heroProjectLabel) heroProjectLabel.textContent = isBn() ? data.bnLabel : data.label;
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
    archive: { ...projects.archive, kicker: 'Telegram · Python · SQLite', copy: 'Telegram-based PDF storage and retrieval with smart categorization, fuzzy search, reading progress tracking, and automated backups running on Termux.', bnCopy: 'Termux-এ চলা smart categorization, fuzzy search, reading progress ও automated backup সহ Telegram-based PDF storage ও retrieval system।', problem: 'Make a growing document library easier to search, retrieve and keep organized.', bnProblem: 'বড় হতে থাকা document library-কে সহজে search, retrieve ও organize করা।', build: 'Telegram bot, SQLite data structure, fuzzy search, reading progress and backup workflows.', bnBuild: 'Telegram bot, SQLite data structure, fuzzy search, reading progress ও backup workflow।', outcome: 'A focused document workflow that can be used directly inside Telegram.', bnOutcome: 'Telegram-এর ভেতরেই ব্যবহার করা যায় এমন একটি focused document workflow।', proof: 'Live bot and public source code.', bnProof: 'Live bot ও public source code।', links: [['Live Bot ↗', 'https://t.me/MRI_PDF_ARCHIVE_Bot'], ['Source Code ↗', 'https://github.com/MD-RASHIDUL-ISLAM-Dev/ri-pdf-vault-bot']] },
    deepseek: { ...projects.deepseek, kicker: 'DeepSeek · OpenRouter · Telegram', copy: 'A conversational Telegram chatbot integrating DeepSeek R1 through OpenRouter API for real-time AI conversations inside Telegram.', bnCopy: 'OpenRouter API-এর মাধ্যমে DeepSeek R1 integrate করা conversational Telegram chatbot, যা Telegram-এর ভেতরে real-time AI conversation চালায়।', problem: 'Bring a capable language model into a familiar, focused chat experience.', bnProblem: 'পরিচিত ও focused chat experience-এর মধ্যে একটি capable language model আনা।', build: 'Telegram conversation flow, OpenRouter API integration and DeepSeek R1 model routing.', bnBuild: 'Telegram conversation flow, OpenRouter API integration ও DeepSeek R1 model routing।', outcome: 'A practical conversational AI direction designed for real-time use inside Telegram.', bnOutcome: 'Telegram-এর ভেতরে real-time ব্যবহারের জন্য তৈরি practical conversational AI direction।', proof: 'Active build plan; source release follows completion.', bnProof: 'Active build plan; completion-এর পরে source release হবে।', links: [] },
    portfolio: { ...projects.portfolio, kicker: 'HTML5 · CSS3 · Vanilla JavaScript', copy: 'A single-page portfolio experience with a custom editorial layout, interactive project rail, animated constellation field, responsive navigation, tabbed capabilities, filters, and thoughtful motion built without a framework.', bnCopy: 'custom editorial layout, interactive project rail, animated constellation field, responsive navigation, tabbed capability, filter ও thoughtful motion সহ framework-বিহীন single-page portfolio experience।', problem: 'Present technical work with enough clarity and personality to be memorable.', bnProblem: 'technical কাজকে এমন clarity ও personality সহ উপস্থাপন করা, যা মনে থাকে।', build: 'Semantic HTML, custom CSS, vanilla JavaScript interactions, responsive layouts and local artwork.', bnBuild: 'semantic HTML, custom CSS, vanilla JavaScript interaction, responsive layout ও local artwork।', outcome: 'A polished personal brand interface that explains the work and creates a direct path to contact.', bnOutcome: 'কাজ ব্যাখ্যা করে এবং contact-এর direct path তৈরি করে এমন polished personal brand interface।', proof: 'Live interface and public source code.', bnProof: 'Live interface ও public source code।', links: [['Live Demo ↗', 'https://www.mdrashidulislam.kdns.fr/'], ['Source Code ↗', 'https://github.com/MD-RASHIDUL-ISLAM-Dev/Personal-portfolio-website']] },
  };
  const openPreview = key => {
    const data = dialogData[key];
    if (!data || !dialog) return;
    const assetCandidates = [data.art, data.art.replace(/^assets\//, '')].filter((value, index, values) => value && values.indexOf(value) === index);
    let assetIndex = 0;
    dialogImage.onerror = () => {
      assetIndex += 1;
      if (assetIndex < assetCandidates.length) { dialogImage.src = assetCandidates[assetIndex]; return; }
      dialogImage.alt = `${data.name} project artwork unavailable`;
    };
    dialogImage.src = assetCandidates[assetIndex];
    dialogImage.alt = `${data.name} project artwork`;
    dialogKicker.textContent = data.kicker;
    dialogTitle.textContent = data.name;
    dialogCopy.textContent = isBn() ? (data.bnCopy || data.copy) : data.copy;
    if (dialogProblem) dialogProblem.textContent = isBn() ? (data.bnProblem || data.problem) : data.problem;
    if (dialogBuild) dialogBuild.textContent = isBn() ? (data.bnBuild || data.build) : data.build;
    if (dialogOutcome) dialogOutcome.textContent = isBn() ? (data.bnOutcome || data.outcome) : data.outcome;
    if (dialogProof) dialogProof.textContent = isBn() ? (data.bnProof || data.proof) : data.proof;
    dialogLinks.innerHTML = data.links.length ? data.links.map(([label, href]) => `<a href="${href}" target="_blank" rel="noopener">${isBn() ? (label === 'Live Bot ↗' ? 'Live Bot ↗' : label === 'Source Code ↗' ? 'Source Code ↗' : label) : label}</a>`).join('') : `<span class="is-muted">${isBn() ? 'Source code শীঘ্রই আসছে' : 'Source code coming soon'}</span>`;
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
  const heroRotationPhrases = ['Telegram AI Bots', 'LLM Systems', 'Responsive Web Apps', 'Agentic AI Workflows'];
  typeLoop($('#hero-rotating'), heroRotationPhrases, 62, 1750);

  /* Local portfolio terminal — controlled command map only */
  const terminalForm = $('#terminal-form');
  const terminalInput = $('#terminal-input');
  const terminalOutput = $('#terminal-output');
  const terminalCommands = {
    help: 'Available commands: help, projects, skills, notes, contact, github, clear.',
    projects: 'MRI PDF Archive Vault — Telegram document search and retrieval. DeepSeek Telegram AI Bot — conversational model workflow. Personal Portfolio — semantic HTML, CSS and JavaScript interface.',
    skills: 'Python · SQLite · Telegram Bot API · OpenRouter · DeepSeek R1 · HTML · CSS · JavaScript · Canvas API · GitHub · Termux.',
    notes: 'Open “Field notes” for short articles on fuzzy search, Termux and practical LLM workflows.',
    contact: 'Email: rashidulislamrifat14708@gmail.com | WhatsApp: +880 1737-608355 | Reply target: 24–48 hours.',
    github: 'Public profile: github.com/MD-RASHIDUL-ISLAM-Dev. The activity snapshot above reads from the public GitHub API.',
    clear: ''
  };
  const terminalCommandsBn = {
    help: 'available command: help, projects, skills, notes, contact, github, clear।',
    projects: 'MRI PDF Archive Vault — Telegram document search ও retrieval। DeepSeek Telegram AI Bot — conversational model workflow। Personal Portfolio — semantic HTML, CSS ও JavaScript interface।',
    skills: 'Python · SQLite · Telegram Bot API · OpenRouter · DeepSeek R1 · HTML · CSS · JavaScript · Canvas API · GitHub · Termux।',
    notes: 'fuzzy search, Termux ও practical LLM workflow নিয়ে short article দেখতে “Field notes” খুলুন।',
    contact: 'Email: rashidulislamrifat14708@gmail.com | WhatsApp: +৮৮০ ১৭৩৭-৬০৮৩৫৫ | Reply target: ২৪–৪৮ ঘণ্টা।',
    github: 'Public profile: github.com/MD-RASHIDUL-ISLAM-Dev। উপরের activity snapshot public GitHub API থেকে data পড়ে।',
    clear: ''
  };
  const appendTerminalLine = (className, content) => {
    if (!terminalOutput) return;
    const line = document.createElement('p');
    line.className = className;
    line.textContent = content;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  };
  terminalForm?.addEventListener('submit', event => {
    event.preventDefault();
    const command = String(terminalInput?.value || '').trim().toLowerCase();
    if (!command) return;
    if (command === 'clear') { terminalOutput.innerHTML = ''; if (terminalInput) terminalInput.value = ''; return; }
    appendTerminalLine('terminal-simulator__echo', `rifat@studio:~$ ${command}`);
    const missingCommand = isBn() ? `Command “${command}” পাওয়া যায়নি। portfolio explore করতে “help” লিখুন।` : `Command “${command}” not found. Type “help” to explore the portfolio.`;
    appendTerminalLine('terminal-response', (isBn() ? terminalCommandsBn : terminalCommands)[command] || missingCommand);
    document.dispatchEvent(new CustomEvent('rifat:track', { detail: { name: 'terminal_command', label: command } }));
    if (terminalInput) terminalInput.value = '';
  });

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

  /* Contact form: optional Formspree-style endpoint, with mailto fallback */
  const contactForm = $('#contact-form');
  const formStatus = $('#form-status');
  contactForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const subject = String(data.get('subject') || '').trim();
    const projectType = String(data.get('projectType') || '').trim();
    const budget = String(data.get('budget') || '').trim();
    const message = String(data.get('message') || '').trim();
    const endpoint = (contactForm.dataset.formEndpoint || '').trim();
    const body = `Name: ${name}\nEmail: ${email}\nProject type: ${projectType}\nBudget: ${budget}\n\n${message}`;
    if (endpoint) {
      if (formStatus) formStatus.textContent = isBn() ? 'আপনার message নিরাপদে পাঠানো হচ্ছে…' : 'Sending your message securely…';
      try {
        const response = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, subject, projectType, budget, message }) });
        if (!response.ok) throw new Error(`Submission failed: ${response.status}`);
        contactForm.reset();
        if (formStatus) formStatus.textContent = isBn() ? 'Message পাঠানো হয়েছে। ধন্যবাদ — ২৪–৪৮ ঘণ্টার মধ্যে reply দেব।' : 'Message sent. Thank you — I will reply within 24–48 hours.';
      } catch (error) {
        if (formStatus) formStatus.textContent = isBn() ? 'Direct submission ব্যর্থ হয়েছে, তাই email draft খোলা হবে।' : 'Direct submission failed, so an email draft will open instead.';
        window.location.href = `mailto:rashidulislamrifat14708@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
      return;
    }
    if (formStatus) formStatus.textContent = isBn() ? 'আপনার email client খোলা হচ্ছে…' : 'Opening your email client…';
    window.location.href = `mailto:rashidulislamrifat14708@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.setTimeout(() => { if (formStatus) formStatus.textContent = isBn() ? 'Email client না খুললে সরাসরি rashidulislamrifat14708@gmail.com-এ লিখুন।' : 'If your email client did not open, write directly to rashidulislamrifat14708@gmail.com.'; }, 1800);
  });

  $$('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
    const email = button.dataset.copyEmail || 'rashidulislamrifat14708@gmail.com';
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(email);
      else { const helper = document.createElement('textarea'); helper.value = email; document.body.appendChild(helper); helper.select(); document.execCommand('copy'); helper.remove(); }
      const original = button.innerHTML;
      button.innerHTML = `<span>✓</span> ${isBn() ? 'Email copy হয়েছে' : 'Email copied'}`;
      window.setTimeout(() => { button.innerHTML = original; }, 2200);
    } catch (error) {
      window.location.href = `mailto:${email}`;
    }
  }));

  /* Bot walkthrough: deterministic, clearly labelled simulation */
  const botMessages = $('#bot-messages');
  const botFlows = {
    search: [['user', 'Search for “MRI workflow”'], ['bot', '<strong>12 results found.</strong><br>Closest matches ranked with title, category and reading progress.']],
    retrieve: [['user', 'Open result #03'], ['bot', '<strong>MRI_workflow.pdf</strong><br>Ready to retrieve · 68% reading progress · 2.4 MB']],
    backup: [['user', 'Show backup status'], ['bot', '<strong>Backup healthy.</strong><br>Last snapshot: today · 03:20 UTC · 3 restore points available.']]
  };
  const botFlowsBn = {
    search: [['user', '“MRI workflow” খুঁজুন'], ['bot', '<strong>১২টি result পাওয়া গেছে।</strong><br>title, category ও reading progress অনুযায়ী সবচেয়ে কাছের match দেখানো হচ্ছে।']],
    retrieve: [['user', 'result #03 খুলুন'], ['bot', '<strong>MRI_workflow.pdf</strong><br>retrieve করার জন্য ready · ৬৮% reading progress · ২.৪ MB']],
    backup: [['user', 'backup status দেখান'], ['bot', '<strong>Backup healthy.</strong><br>শেষ snapshot: আজ · ০৩:২০ UTC · ৩টি restore point available।']]
  };
  $$('[data-bot-action]').forEach(button => button.addEventListener('click', () => {
    const flow = (isBn() ? botFlowsBn : botFlows)[button.dataset.botAction];
    if (!flow || !botMessages) return;
    flow.forEach(([role, text]) => {
      const message = document.createElement('div');
      message.className = `bot-message bot-message--${role}`;
      message.innerHTML = `<small>now</small><p>${text}</p>`;
      botMessages.appendChild(message);
    });
    botMessages.scrollTop = botMessages.scrollHeight;
    refreshNewContentLanguage();
  }));

  /* Case-study deep dive tabs */
  const deepDiveData = {
    archive: { kicker: 'Telegram · Python · SQLite', title: 'MRI PDF Archive Vault', summary: 'A document workflow designed around the moment a file needs to be found, not merely stored.', bnSummary: 'শুধু file store নয়, যে মুহূর্তে file খুঁজে পাওয়া দরকার সেই মুহূর্তকে কেন্দ্র করে তৈরি document workflow।', problem: 'A growing PDF library was becoming harder to search, organise and revisit.', bnProblem: 'বড় হতে থাকা PDF library search, organise ও revisit করা কঠিন হয়ে উঠছিল।', thinking: 'Start where the user already works, then remove the repeated steps that slow retrieval down.', bnThinking: 'user যেখানে কাজ করেন সেখান থেকেই শুরু করে retrieval ধীর করে দেওয়া repeated step সরানো।', decision: 'Use Telegram as the interface, SQLite for durable state, and fuzzy matching for forgiving search.', bnDecision: 'interface হিসেবে Telegram, durable state-এর জন্য SQLite এবং forgiving search-এর জন্য fuzzy matching ব্যবহার করা।', challenge: 'Keep metadata, file storage, progress and backup behaviour coherent inside a small self-hosted system.', bnChallenge: 'ছোট self-hosted system-এর মধ্যে metadata, file storage, progress ও backup behavior coherent রাখা।', solution: 'A focused bot workflow with categorisation, fuzzy search, reading progress and automated backups.', bnSolution: 'categorisation, fuzzy search, reading progress ও automated backup সহ focused bot workflow।', outcome: 'A live, usable document vault that turns Telegram into a practical retrieval interface.', bnOutcome: 'Telegram-কে practical retrieval interface-এ রূপ দেওয়া live ও usable document vault।', href: 'https://t.me/MRI_PDF_ARCHIVE_Bot', preview: 'archive' },
    deepseek: { kicker: 'DeepSeek · OpenRouter · Telegram', title: 'DeepSeek Telegram AI Bot', summary: 'A conversational AI direction that places model access inside a familiar, low-friction interface.', bnSummary: 'পরিচিত ও low-friction interface-এর মধ্যে model access রাখার conversational AI direction।', problem: 'Users should be able to ask questions without leaving the conversation surface they already understand.', bnProblem: 'user যেন পরিচিত conversation surface না ছেড়েই question করতে পারেন।', thinking: 'Keep the first version focused: one clear conversational loop before adding a crowded command system.', bnThinking: 'প্রথম version focused রাখা: crowded command system যোগ করার আগে একটি clear conversational loop।', decision: 'Route model requests through OpenRouter so the model layer can evolve without rewriting the Telegram experience.', bnDecision: 'OpenRouter-এর মাধ্যমে model request route করা, যাতে Telegram experience rewrite না করেই model layer evolve করতে পারে।', challenge: 'Balance response quality, latency, API fallbacks and readable output inside a chat-first flow.', bnChallenge: 'chat-first flow-এর মধ্যে response quality, latency, API fallback ও readable output balance করা।', solution: 'A Telegram conversation layer connected to DeepSeek R1 through OpenRouter with a clear path for future expansion.', bnSolution: 'OpenRouter-এর মাধ্যমে DeepSeek R1-এর সঙ্গে connected Telegram conversation layer, যার future expansion path clear।', outcome: 'An active build direction with a practical foundation for real-time conversational AI.', bnOutcome: 'real-time conversational AI-এর practical foundation সহ active build direction।', href: '#contact', preview: 'deepseek' },
    portfolio: { kicker: 'HTML5 · CSS3 · Vanilla JavaScript', title: 'Personal Portfolio Website', summary: 'An interface designed to make technical work feel clear, calm and memorable.', bnSummary: 'technical কাজকে clear, calm ও memorable করার জন্য design করা interface।', problem: 'A portfolio needs to prove engineering ability without becoming a catalogue of disconnected effects.', bnProblem: 'portfolio-কে disconnected effect-এর catalogue না বানিয়ে engineering ability prove করা।', thinking: 'Lead with positioning, then move through proof, process and a low-friction contact path.', bnThinking: 'positioning দিয়ে শুরু করে proof, process ও low-friction contact path-এর দিকে এগোনো।', decision: 'Use semantic HTML, custom CSS and vanilla JavaScript to keep the site fast, portable and understandable.', bnDecision: 'site-কে fast, portable ও understandable রাখতে semantic HTML, custom CSS ও vanilla JavaScript ব্যবহার করা।', challenge: 'Balance editorial art direction with responsive behavior, keyboard access and honest proof signals.', bnChallenge: 'editorial art direction-এর সঙ্গে responsive behavior, keyboard access ও honest proof signal balance করা।', solution: 'A single-page system with project rails, filters, case studies, responsive motion, SEO and share-ready metadata.', bnSolution: 'project rail, filter, case study, responsive motion, SEO ও share-ready metadata সহ single-page system।', outcome: 'A live personal brand interface that explains the work and makes the next conversation obvious.', bnOutcome: 'কাজ ব্যাখ্যা করে এবং পরবর্তী conversation স্পষ্ট করে এমন live personal brand interface।', href: 'https://www.mdrashidulislam.kdns.fr/', preview: 'portfolio' }
  };
  const setDeepDive = key => {
    const data = deepDiveData[key];
    if (!data) return;
    ['kicker','title'].forEach(field => { const node = $(`#deep-${field}`); if (node) node.textContent = data[field]; });
    ['summary','problem','thinking','decision','challenge','solution','outcome'].forEach(field => { const node = $(`#deep-${field}`); if (node) node.textContent = isBn() ? (data[`bn${field.charAt(0).toUpperCase()}${field.slice(1)}`] || data[field]) : data[field]; });
    const link = $('#deep-project-link');
    if (link) { link.href = data.href; if (data.href.startsWith('http')) { link.target = '_blank'; link.rel = 'noopener'; } else { link.removeAttribute('target'); link.removeAttribute('rel'); } }
    $$('.deep-dive-tab').forEach(tab => { const active = tab.dataset.deepDive === key; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); });
    const preview = $('#deep-preview');
    if (preview) preview.dataset.preview = data.preview;
  };
  $$('.deep-dive-tab').forEach(tab => tab.addEventListener('click', () => setDeepDive(tab.dataset.deepDive)));

  /* Public GitHub snapshot — no token required, with graceful fallback */
  const githubUser = 'MD-RASHIDUL-ISLAM-Dev';
  const githubState = $('#github-state');
  const renderGithubFallback = message => {
    if (githubState) githubState.textContent = isBn() ? 'এই মুহূর্তে unavailable' : 'Unavailable right now';
    const list = $('#github-repos');
    if (list) list.innerHTML = `<p class="small-note">${isBn() ? 'Public snapshot load করা যায়নি।' : message} <a href="https://github.com/${githubUser}" target="_blank" rel="noopener">${isBn() ? 'profile সরাসরি খুলুন →' : 'Open the profile directly →'}</a></p>`;
    for (let index = 0; index < 64; index += 1) { const cell = document.createElement('i'); cell.dataset.level = String(index % 5 === 0 ? 1 : 0); $('#github-heatmap')?.appendChild(cell); }
  };
  const renderGithub = async () => {
    const heatmap = $('#github-heatmap');
    try {
      const [profileResponse, reposResponse, eventsResponse] = await Promise.all([fetch(`https://api.github.com/users/${githubUser}`), fetch(`https://api.github.com/users/${githubUser}/repos?per_page=100&sort=updated`), fetch(`https://api.github.com/users/${githubUser}/events/public?per_page=100`)]);
      if (!profileResponse.ok || !reposResponse.ok || !eventsResponse.ok) throw new Error('GitHub public API unavailable');
      const profile = await profileResponse.json();
      const repos = await reposResponse.json();
      const events = await eventsResponse.json();
      const stars = repos.reduce((total, repo) => total + Number(repo.stargazers_count || 0), 0);
      $('#github-repos-count').textContent = String(profile.public_repos ?? repos.length);
      $('#github-stars-count').textContent = String(stars);
      $('#github-followers-count').textContent = String(profile.followers ?? 0);
      if (githubState) githubState.textContent = isBn() ? 'এইমাত্র updated' : 'Updated just now';
      const publicActivity = events.filter(event => ['PushEvent','CreateEvent','PullRequestEvent','IssuesEvent'].includes(event.type));
      if (heatmap) { heatmap.innerHTML = ''; for (let index = 0; index < 64; index += 1) { const cell = document.createElement('i'); const event = publicActivity[index]; cell.dataset.level = event ? (event.type === 'PushEvent' ? 4 : event.type === 'PullRequestEvent' ? 3 : 2) : (index % 9 === 0 ? 1 : 0); if (event) cell.title = `${event.type.replace('Event','')} · ${new Date(event.created_at).toLocaleDateString()}`; heatmap.appendChild(cell); } }
      const list = $('#github-repos');
      if (list) list.innerHTML = repos.slice(0, 4).map(repo => `<div class="github-repo"><span><strong>${repo.name}</strong><small>${repo.language || (isBn() ? 'public repository' : 'Public repository')} · ★ ${repo.stargazers_count || 0}</small></span><a href="${repo.html_url}" target="_blank" rel="noopener">${isBn() ? 'দেখুন ↗' : 'View ↗'}</a></div>`).join('') || `<p class="small-note">${isBn() ? 'কোনো public repository পাওয়া যায়নি।' : 'No public repositories returned.'}</p>`;
      const timeline = $('#github-timeline');
      if (timeline) timeline.innerHTML = publicActivity.slice(0, 5).map(event => `<div class="github-timeline__item"><span>${event.type.replace('Event','')}</span><small>${new Date(event.created_at).toLocaleDateString()}</small></div>`).join('') || `<p class="small-note">${isBn() ? 'কোনো সাম্প্রতিক public activity পাওয়া যায়নি।' : 'No recent public activity returned.'}</p>`;
    } catch (error) { renderGithubFallback(isBn() ? 'Public snapshot load করা যায়নি।' : 'The public snapshot could not load.'); }
  };
  renderGithub();

  /* Project comparison tool */
  const comparisonData = {
    archive: { name: 'MRI PDF Archive Vault', bnName: 'MRI PDF Archive Vault', problem: 'Document retrieval', bnProblem: 'document retrieval', stack: 'Telegram · Python · SQLite', status: 'Shipped', bnStatus: 'Shipped', proof: 'Live bot + public source', bnProof: 'Live bot + public source' },
    deepseek: { name: 'DeepSeek Telegram AI Bot', bnName: 'DeepSeek Telegram AI Bot', problem: 'Conversational AI in Telegram', bnProblem: 'Telegram-এর মধ্যে conversational AI', stack: 'DeepSeek · OpenRouter · Telegram', status: 'In progress', bnStatus: 'চলমান কাজ', proof: 'Active build plan', bnProof: 'active build plan' },
    portfolio: { name: 'Personal Portfolio Website', bnName: 'Personal Portfolio Website', problem: 'Clear technical positioning', bnProblem: 'clear technical positioning', stack: 'HTML · CSS · JavaScript', status: 'Live', bnStatus: 'Live', proof: 'Live site + public source', bnProof: 'live site + public source' }
  };
  const renderComparison = key => {
    const data = comparisonData[key] || comparisonData.archive;
    const select = $('#project-compare-select');
    if (select && select.value !== key) select.value = key;
    const fields = { problem: isBn() ? data.bnProblem : data.problem, stack: data.stack, status: isBn() ? data.bnStatus : data.status, proof: isBn() ? data.bnProof : data.proof };
    Object.entries(fields).forEach(([field, value]) => { const node = $(`#compare-${field}`); if (node) node.textContent = value; });
    const status = $('#comparison-status'); if (status) status.textContent = '';
    return data;
  };
  $('#project-compare-select')?.addEventListener('change', event => { const data = renderComparison(event.target.value); const url = new URL(window.location.href); url.searchParams.set('compare', event.target.value); window.history.replaceState({}, '', url); document.dispatchEvent(new CustomEvent('rifat:track', { detail: { name: 'comparison_change', label: data.name } })); });
  renderComparison(new URLSearchParams(window.location.search).get('compare') || 'archive');
  const comparisonText = () => { const data = comparisonData[$('#project-compare-select')?.value] || comparisonData.archive; return isBn() ? `Project comparison\n\n${data.bnName}\nমূল problem: ${data.bnProblem}\nStack: ${data.stack}\nStatus: ${data.bnStatus}\nProof path: ${data.bnProof}\n\nPortfolio: ${window.location.href}` : `Project comparison\n\n${data.name}\nPrimary problem: ${data.problem}\nStack: ${data.stack}\nStatus: ${data.status}\nProof path: ${data.proof}\n\nPortfolio: ${window.location.href}`; };
  $('#comparison-download')?.addEventListener('click', () => { const blob = new Blob([comparisonText()], { type: 'text/plain;charset=utf-8' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'rifat-project-comparison.txt'; link.click(); URL.revokeObjectURL(link.href); const status = $('#comparison-status'); if (status) status.textContent = isBn() ? 'Comparison text brief হিসেবে download হয়েছে।' : 'Comparison downloaded as a text brief.'; });
  $('#comparison-share')?.addEventListener('click', async () => { const url = new URL(window.location.href); url.searchParams.set('compare', $('#project-compare-select')?.value || 'archive'); try { await navigator.clipboard.writeText(url.href); if ($('#comparison-status')) $('#comparison-status').textContent = isBn() ? 'Shareable comparison link copy হয়েছে।' : 'Shareable comparison link copied.'; } catch (error) { window.prompt('Copy this comparison link:', url.href); } });

  /* Fit Quiz 2.0: recommendation + starting scope, without inventing a quote */
  const fitScopeByGoal = {
    bot: { service: 'Telegram AI Bot service', bnService: 'Telegram AI Bot service', case: 'MRI PDF Archive Vault', bnCase: 'MRI PDF Archive Vault', href: '#case-studies', scopes: { focused: 'A focused Telegram workflow with one clear command or conversation loop, a small data layer, failure states and deployment notes.', multi: 'Connected Telegram workflows with search or retrieval, durable state, admin actions and a clear recovery path.', platform: 'A maintainable Telegram product foundation with modular flows, integrations, state management and handover documentation.' }, bnScopes: { focused: 'একটি clear command বা conversation loop, ছোট data layer, failure state ও deployment note সহ focused Telegram workflow।', multi: 'search বা retrieval, durable state, admin action ও clear recovery path সহ connected Telegram workflow।', platform: 'modular flow, integration, state management ও handover documentation সহ maintainable Telegram product foundation।' } },
    llm: { service: 'LLM Integrations service', bnService: 'LLM Integration service', case: 'DeepSeek Telegram AI Bot', bnCase: 'DeepSeek Telegram AI Bot', href: '#case-studies', scopes: { focused: 'A model gateway, prompt contract, response formatting and fallback path tested against a small question set.', multi: 'LLM routing, structured prompts, conversation state, evaluation cases and human-readable failure handling.', platform: 'A reusable AI application foundation with provider abstraction, observability, safety boundaries and integration handover.' }, bnScopes: { focused: 'ছোট question set দিয়ে tested model gateway, prompt contract, response formatting ও fallback path।', multi: 'LLM routing, structured prompt, conversation state, evaluation case ও human-readable failure handling।', platform: 'provider abstraction, observability, safety boundary ও integration handover সহ reusable AI application foundation।' } },
    automation: { service: 'Python Automation service', bnService: 'Python Automation service', case: 'MRI PDF Archive Vault', bnCase: 'MRI PDF Archive Vault', href: '#case-studies', scopes: { focused: 'One repeatable Python utility with clear inputs, logs, local state and a recovery note.', multi: 'Several connected automation steps with file or database state, notifications and repeatable operational checks.', platform: 'A reusable automation foundation with modular jobs, persistence, error recovery and deployment documentation.' }, bnScopes: { focused: 'clear input, log, local state ও recovery note সহ একটি repeatable Python utility।', multi: 'file বা database state, notification ও repeatable operational check সহ connected automation step।', platform: 'modular job, persistence, error recovery ও deployment documentation সহ reusable automation foundation।' } },
    web: { service: 'Responsive Web Interfaces service', bnService: 'Responsive Web Interface service', case: 'Personal Portfolio Website', bnCase: 'Personal Portfolio Website', href: '#projects', scopes: { focused: 'A responsive page system with semantic structure, keyboard states, mobile layout and deployment-ready local assets.', multi: 'Several connected routes or states with reusable components, responsive behavior and clear content hierarchy.', platform: 'A maintainable web foundation with accessible interaction patterns, content structure, performance posture and handover notes.' }, bnScopes: { focused: 'semantic structure, keyboard state, mobile layout ও deployment-ready local asset সহ responsive page system।', multi: 'reusable component, responsive behavior ও clear content hierarchy সহ connected route বা state।', platform: 'accessible interaction pattern, content structure, performance posture ও handover note সহ maintainable web foundation।' } }
  };
  const fitLabels = { budget: { lean: 'Lean first version', focused: 'Focused build', growth: 'Growth build', unsure: 'Budget to be shaped' }, deadline: { flexible: 'Flexible deadline', month: 'Within 1 month', urgent: 'Within 2 weeks', unsure: 'Deadline to be shaped' }, platform: { telegram: 'Telegram', web: 'Web', hybrid: 'Telegram + web', termux: 'Termux / self-hosted' }, integration: { llm: 'LLM / AI API', files: 'Files / search / storage', automation: 'Automation / notifications', none: 'No integration yet' } };
  $('#fit-quiz-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const match = fitScopeByGoal[String(values.goal)] || fitScopeByGoal.bot;
    const bn = isBn();
    const scope = (bn ? match.bnScopes : match.scopes)[String(values.complexity)] || (bn ? match.bnScopes : match.scopes).focused;
    const budget = fitLabels.budget[String(values.budget)] || 'Budget to be shaped';
    const deadline = fitLabels.deadline[String(values.deadline)] || 'Deadline to be shaped';
    const budgetBn = { lean: 'lean first version', focused: 'focused build', growth: 'growth build', unsure: 'budget shape নির্ধারণ হবে' }[String(values.budget)] || 'budget shape নির্ধারণ হবে';
    const deadlineBn = { flexible: 'flexible deadline', month: '১ মাসের মধ্যে', urgent: '২ সপ্তাহের মধ্যে', unsure: 'deadline shape নির্ধারণ হবে' }[String(values.deadline)] || 'deadline shape নির্ধারণ হবে';
    const platform = fitLabels.platform[String(values.platform)] || values.platform;
    const integration = fitLabels.integration[String(values.integration)] || values.integration;
    const platformBn = { telegram: 'Telegram', web: 'Web', hybrid: 'Telegram + web', termux: 'Termux / self-hosted' }[String(values.platform)] || values.platform;
    const integrationBn = { llm: 'LLM / AI API', files: 'file / search / storage', automation: 'automation / notification', none: 'এখনও integration নেই' }[String(values.integration)] || values.integration;
    const recommendation = `${bn ? match.bnService : match.service} · ${bn ? budgetBn : budget} · ${bn ? deadlineBn : deadline}`;
    const recommendationNode = $('#fit-recommendation'); const scopeNode = $('#fit-scope'); const caseNode = $('#fit-case-study');
    if (recommendationNode) recommendationNode.textContent = recommendation;
    if (scopeNode) scopeNode.textContent = bn ? `${scope} Platform: ${platformBn}। Integration: ${integrationBn}। Current stage: ${values.stage}।` : `${scope} Best platform: ${platform}. Integration: ${integration}. Current stage: ${values.stage}.`;
    if (caseNode) { caseNode.textContent = `${bn ? 'প্রাসঙ্গিক case study' : 'Relevant case study'}: ${bn ? match.bnCase : match.case} →`; caseNode.href = match.href; }
    document.dispatchEvent(new CustomEvent('rifat:track', { detail: { name: 'fit_quiz_complete', label: `${values.goal}:${values.complexity}` } }));
  });

  /* Structured project brief generator with local download/email/Telegram share */
  let latestBrief = '';
  const briefForm = $('#brief-form');
  const renderBrief = values => { const name = String(values.name || (isBn() ? 'Project owner' : 'Project owner')).trim(); const bn = isBn(); const briefTitle = `${name} · ${bn ? 'project brief' : 'project brief'}`; const goal = String(values.goal || '').trim(); const audience = String(values.audience || '').trim(); const success = String(values.success || '').trim(); const constraints = String(values.constraints || '').trim() || (bn ? 'Discovery-এর সময় নির্ধারণ হবে।' : 'To be clarified during discovery.'); latestBrief = bn ? `PROJECT BRIEF\n====================\nনাম: ${name}\n\nলক্ষ্য\n${goal}\n\nপ্রধান user\n${audience}\n\nসফলতার সংজ্ঞা\n${success}\n\nConstraint, integration ও note\n${constraints}\n\nপ্রথম conversation-এর প্রস্তাব\nছোট useful version, platform, integration boundary, delivery constraint এবং প্রথম proof milestone নিশ্চিত করুন।\n\nতৈরি করা হয়েছে: ${window.location.href}` : `PROJECT BRIEF\n====================\nName: ${name}\n\nGoal\n${goal}\n\nPrimary users\n${audience}\n\nDefinition of success\n${success}\n\nConstraints, integrations and notes\n${constraints}\n\nSuggested first conversation\nConfirm the smallest useful version, platform, integration boundaries, delivery constraints and the first proof milestone.\n\nGenerated from: ${window.location.href}`; if ($('#brief-output-title')) $('#brief-output-title').textContent = briefTitle; if ($('#brief-output-text')) $('#brief-output-text').textContent = latestBrief; ['brief-download','brief-email','brief-telegram'].forEach(id => { const node = $(`#${id}`); if (node) node.disabled = false; }); return briefTitle; };
  briefForm?.addEventListener('submit', event => { event.preventDefault(); const values = Object.fromEntries(new FormData(briefForm).entries()); renderBrief(values); const status = $('#brief-status'); if (status) status.textContent = isBn() ? 'Brief তৈরি হয়েছে। এটি download করুন অথবা prepared email/Telegram message খুলুন।' : 'Brief generated. Download it or open a prepared email/Telegram message.'; document.dispatchEvent(new CustomEvent('rifat:track', { detail: { name: 'brief_generated' } })); });
  $('#brief-download')?.addEventListener('click', () => { if (!latestBrief) return; const blob = new Blob([latestBrief], { type: 'text/plain;charset=utf-8' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'rifat-project-brief.txt'; link.click(); URL.revokeObjectURL(link.href); });
  $('#brief-email')?.addEventListener('click', () => { if (!latestBrief) return; window.location.href = `mailto:rashidulislamrifat14708@gmail.com?subject=${encodeURIComponent(isBn() ? 'Rifat-এর জন্য project brief' : 'Project brief for Rifat')}&body=${encodeURIComponent(latestBrief)}`; });
  $('#brief-telegram')?.addEventListener('click', () => { if (!latestBrief) return; window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(latestBrief)}`, '_blank', 'noopener'); });

  /* Optional uptime endpoint: expected JSON {status: "up", uptime: "99.9%"} */
  const uptimeNode = $('#bot-uptime');
  const uptimeEndpoint = uptimeNode?.dataset.uptimeEndpoint?.trim();
  if (uptimeEndpoint) {
    fetch(uptimeEndpoint).then(response => { if (!response.ok) throw new Error('Uptime endpoint unavailable'); return response.json(); }).then(status => { uptimeNode.textContent = `${status.uptime || status.status || 'Status available'}`; }).catch(() => { uptimeNode.textContent = 'Status unavailable'; });
  }

  /* Case-study deep link support */
  const caseStudyQuery = new URLSearchParams(window.location.search).get('project');
  if (caseStudyQuery && deepDiveData[caseStudyQuery]) { setDeepDive(caseStudyQuery); window.setTimeout(() => $('#case-studies')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }), 120); }

  /* Optional discovery-call link; never invent a booking URL */
  $$('[data-booking-url]').forEach(button => button.addEventListener('click', event => { const url = button.dataset.bookingUrl?.trim(); if (url) { event.preventDefault(); window.open(url, '_blank', 'noopener'); } else { event.preventDefault(); const status = $('#form-status'); if (status) status.textContent = 'Booking link is not configured yet. Please send a project brief and I will reply with the next available time.'; $('#contact')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); } }));

  /* Section beacon and back-to-top utility */
  const sectionBeacon = $('#section-beacon');
  const sectionBeaconLabel = $('#section-beacon-label');
  const sectionNames = new Map([...document.querySelectorAll('main > section[id]')].map(section => [section.id, section.querySelector('.section-kicker')?.textContent.trim() || section.id]));
  const sectionsForSpy = [...document.querySelectorAll('main > section[id]')];
  const sectionNamesBn = { about: 'সম্পর্কে', services: 'সেবাসমূহ', projects: 'কাজ', expertise: 'দক্ষতা', 'case-studies': 'কেস স্টাডি', 'architecture-map': 'আর্কিটেকচার', 'technical-proof': 'প্রমাণ', activity: 'অ্যাক্টিভিটি', opensource: 'Open-source', notes: 'নোট', 'now-building': 'চলমান কাজ', 'studio-terminal': 'টার্মিনাল', compare: 'তুলনা', 'fit-quiz': 'প্রজেক্ট ফিট', 'brief-generator': 'ব্রিফ', performance: 'পারফরম্যান্স', feedback: 'ফিডব্যাক', availability: 'অ্যাভেইলেবিলিটি', 'client-portal': 'ক্লায়েন্ট পোর্টাল', skills: 'স্কিল', process: 'প্রক্রিয়া', faq: 'প্রশ্ন', newsletter: 'Build Notes', 'analytics-console': 'অ্যানালিটিক্স', contact: 'যোগাযোগ' };
  if ('IntersectionObserver' in window && sectionBeaconLabel) { const spy = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { const id = entry.target.id; const label = sectionNames.get(id) || id; sectionBeaconLabel.textContent = document.documentElement.dataset.language === 'bn' ? (sectionNamesBn[id] || label) : label; [...$$('.site-nav__links a'), ...tocLinks].forEach(link => { const active = link.getAttribute('href') === `#${id}`; link.classList.toggle('is-current', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); } }), { rootMargin: '-35% 0px -55% 0px', threshold: 0 }); sectionsForSpy.forEach(section => spy.observe(section)); }
  const backToTop = $('#back-to-top');
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
  window.addEventListener('scroll', () => backToTop?.classList.toggle('is-visible', window.scrollY > 700), { passive: true });

  /* Compact table of contents with keyboard-friendly active state */
  const toc = $('#section-toc');
  const tocToggle = $('#section-toc-toggle');
  const tocLinks = $$('.section-toc__links a');
  const closeToc = () => { if (!toc || !tocToggle) return; toc.classList.remove('is-open'); tocToggle.setAttribute('aria-expanded', 'false'); };
  tocToggle?.addEventListener('click', () => { const open = !toc?.classList.contains('is-open'); toc?.classList.toggle('is-open', open); tocToggle.setAttribute('aria-expanded', String(open)); if (open) window.setTimeout(() => tocLinks[0]?.focus(), 0); });
  tocLinks.forEach(link => link.addEventListener('click', closeToc));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeToc(); });

  /* Client portal preview — deliberately local and non-sensitive */
  const portalToggle = $('#client-portal-toggle');
  const portalPanel = $('#client-portal-panel');
  const portalContent = $('#portal-panel-content');
  let portalReturnFocus = null;
  const portalData = {
    overview: { kicker: 'Active brief', bnKicker: 'active brief', title: 'Telegram document workflow', bnTitle: 'Telegram document workflow', copy: 'Focused first version: searchable PDF retrieval with a clear backup path.', bnCopy: 'focused first version: clear backup path সহ searchable PDF retrieval।', metrics: ['02 milestones', '03 handover notes', '01 active brief'] },
    milestones: { kicker: 'Milestone view', bnKicker: 'milestone view', title: 'Scope → prototype → handover', bnTitle: 'scope → prototype → handover', copy: 'A client can see the current phase, the next decision and what is ready for review without searching through chat history.', bnCopy: 'chat history search না করেই client current phase, next decision এবং review-এর জন্য ready অংশ দেখতে পারবেন।', metrics: ['01 current phase', '01 next decision', '02 review points'] },
    handover: { kicker: 'Handover notes', bnKicker: 'handover note', title: 'Readable after launch', bnTitle: 'launch-এর পরেও readable', copy: 'Deployment notes, environment requirements, recovery steps and future improvements stay visible in one calm place.', bnCopy: 'deployment note, environment requirement, recovery step ও future improvement একটি calm জায়গায় visible থাকে।', metrics: ['03 setup notes', '01 recovery path', '01 future queue'] }
  };
  const setPortalTab = key => { const data = portalData[key] || portalData.overview; const bn = isBn(); if (portalContent) portalContent.innerHTML = `<p class="caps">${bn ? data.bnKicker : data.kicker}</p><h3>${bn ? data.bnTitle : data.title}</h3><p>${bn ? data.bnCopy : data.copy}</p><div class="portal-metrics">${data.metrics.map(item => `<span><b>${item.split(' ')[0]}</b> ${item.slice(item.indexOf(' ') + 1)}</span>`).join('')}</div>`; $$('.portal-tab').forEach(tab => { const active = tab.dataset.portalTab === key; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); }); };
  $$('.portal-tab').forEach(tab => tab.addEventListener('click', () => setPortalTab(tab.dataset.portalTab)));
  const setPortalToggleLanguageLabel = () => { if (!portalToggle || !portalPanel) return; const open = !portalPanel.hidden; portalToggle.textContent = open ? (isBn() ? 'portal preview বন্ধ করুন ↑' : 'Close portal preview ↑') : (isBn() ? 'portal preview খুলুন →' : 'Open portal preview →'); };
  const setPortalOpen = open => { if (!portalPanel || !portalToggle) return; portalPanel.hidden = !open; portalToggle.setAttribute('aria-expanded', String(open)); setPortalToggleLanguageLabel(); if (open) { portalReturnFocus = document.activeElement; window.setTimeout(() => $('.portal-tab')?.focus(), 0); } else if (portalReturnFocus instanceof HTMLElement) portalReturnFocus.focus(); };
  portalToggle?.addEventListener('click', () => setPortalOpen(portalPanel?.hidden));
  const portalQuery = new URLSearchParams(window.location.search).get('portal');
  if (portalQuery === 'preview') { setPortalOpen(true); window.setTimeout(() => $('#client-portal')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }), 120); }

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));

  /* Project-aware assistant: local retrieval by default, optional server endpoint for generative AI */
  const aiAssistant = $('#ai-assistant');
  const aiLauncher = $('#ai-launcher');
  const aiPanel = $('#ai-panel');
  const aiClose = $('#ai-close');
  const aiForm = $('#ai-form');
  const aiInput = $('#ai-input');
  const aiMessages = $('#ai-messages');
  const aiNote = $('#ai-note');
  const assistantEndpoint = aiAssistant?.dataset.aiEndpoint?.trim();
  let assistantReturnFocus = null;
  const knowledgeBase = [
    { topic: 'services', text: 'Rifat builds Telegram AI bots, LLM integrations, Python automation utilities, and responsive web interfaces. The work starts from a practical user problem and a focused first version.', bn: 'Rifat Telegram AI bot, LLM integration, Python automation utility এবং responsive web interface তৈরি করেন। কাজ শুরু হয় practical user problem ও focused first version থেকে।' },
    { topic: 'mri vault', text: 'MRI PDF Archive Vault is a Telegram-based PDF storage and retrieval workflow. It combines smart categorisation, fuzzy search, reading progress, SQLite-backed state, and automated backups on Termux.', bn: 'MRI PDF Archive Vault হলো Telegram-based PDF storage ও retrieval workflow। এতে smart categorisation, fuzzy search, reading progress, SQLite-backed state এবং Termux-এ automated backup আছে।' },
    { topic: 'deepseek bot', text: 'DeepSeek Telegram AI Bot is an active conversational AI build that connects DeepSeek R1 through OpenRouter to a focused Telegram conversation flow. The design considers model routing, readable output, latency, and fallback options.', bn: 'DeepSeek Telegram AI Bot হলো active conversational AI build, যা OpenRouter-এর মাধ্যমে DeepSeek R1-কে focused Telegram conversation flow-এর সঙ্গে connect করে। এতে model routing, readable output, latency ও fallback বিবেচনা করা হয়েছে।' },
    { topic: 'portfolio', text: 'This portfolio uses semantic HTML, modern CSS and vanilla JavaScript. It includes project filtering, case studies, Canvas effects, accessible dialogs, GitHub public activity, and theme and language controls.', bn: 'এই portfolio semantic HTML, modern CSS ও vanilla JavaScript ব্যবহার করে তৈরি। এতে project filter, case study, Canvas effect, accessible dialog, GitHub public activity এবং theme ও language control আছে।' },
    { topic: 'skills', text: 'Core working skills include Python, SQLite, Telegram Bot API, AsyncIO, OpenRouter API, DeepSeek R1, prompt engineering, HTML, CSS, JavaScript, Canvas API, GitHub and Termux.', bn: 'মূল working skill হলো Python, SQLite, Telegram Bot API, AsyncIO, OpenRouter API, DeepSeek R1, prompt engineering, HTML, CSS, JavaScript, Canvas API, GitHub ও Termux।' },
    { topic: 'contact', text: 'For a project discussion, use the contact form, email rashidulislamrifat14708@gmail.com, or WhatsApp +880 1737-608355. The stated reply target is 24–48 hours.', bn: 'project discussion-এর জন্য contact form, email rashidulislamrifat14708@gmail.com অথবা WhatsApp +৮৮০ ১৭৩৭-৬০৮৩৫৫ ব্যবহার করুন। reply target ২৪–৪৮ ঘণ্টা।' }
  ];
  const assistantTokens = value => String(value || '').toLowerCase().match(/[a-z0-9]+/g) || [];
  const retrieveLocalAnswer = question => {
    const tokens = assistantTokens(question);
    const ranked = knowledgeBase.map(item => ({ item, score: tokens.reduce((total, token) => total + (item.topic.includes(token) || item.text.toLowerCase().includes(token) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score);
    if (!ranked[0] || ranked[0].score === 0) return isBn() ? 'Rifat-এর services, MRI PDF Archive Vault, DeepSeek Telegram AI Bot, technical skill, portfolio অথবা contact path সম্পর্কে প্রশ্ন করুন।' : 'I can answer questions about Rifat’s services, MRI PDF Archive Vault, DeepSeek Telegram AI Bot, technical skills, this portfolio, or the contact path. Try one of those topics.';
    return isBn() ? (ranked[0].item.bn || ranked[0].item.text) : ranked[0].item.text;
  };
  const addAssistantMessage = (role, text) => {
    if (!aiMessages) return;
    const item = document.createElement('div');
    item.className = `ai-message ai-message--${role}`;
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    item.appendChild(paragraph);
    aiMessages.appendChild(item);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  };
  const setAssistantOpen = open => {
    if (!aiPanel || !aiLauncher) return;
    aiPanel.hidden = !open;
    aiLauncher.setAttribute('aria-expanded', String(open));
    if (open) { assistantReturnFocus = document.activeElement; window.setTimeout(() => aiInput?.focus(), 40); }
    else if (assistantReturnFocus instanceof HTMLElement) assistantReturnFocus.focus();
  };
  aiLauncher?.addEventListener('click', () => setAssistantOpen(aiPanel?.hidden));
  aiClose?.addEventListener('click', () => setAssistantOpen(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && aiPanel && !aiPanel.hidden) setAssistantOpen(false); });
  const askAssistant = async question => {
    const cleanQuestion = String(question || '').trim();
    if (!cleanQuestion) return;
    addAssistantMessage('user', cleanQuestion);
    if (aiInput) aiInput.value = '';
    document.dispatchEvent(new CustomEvent('rifat:track', { detail: { name: 'assistant_question' } }));
    if (assistantEndpoint) {
      if (aiNote) aiNote.textContent = isBn() ? 'configured secure assistant endpoint-এ যোগাযোগ করা হচ্ছে…' : 'Contacting the configured secure assistant endpoint…';
      try {
        const response = await fetch(assistantEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ message: cleanQuestion, context: knowledgeBase }) });
        if (!response.ok) throw new Error('Assistant endpoint unavailable');
        const data = await response.json();
        addAssistantMessage('bot', String(data.answer || data.message || retrieveLocalAnswer(cleanQuestion)));
        if (aiNote) aiNote.textContent = isBn() ? 'Secure assistant endpoint থেকে response এসেছে।' : 'Secure assistant endpoint response.';
        return;
      } catch (error) { if (aiNote) aiNote.textContent = isBn() ? 'Secure endpoint unavailable; local project retrieval response দিচ্ছে।' : 'Secure endpoint unavailable; local project retrieval is answering instead.'; }
    }
    addAssistantMessage('bot', retrieveLocalAnswer(cleanQuestion));
    if (aiNote) aiNote.textContent = isBn() ? 'Local retrieval mode active। কোনো question external AI service-এ পাঠানো হয় না।' : 'Local retrieval mode is active. No question is sent to an external AI service.';
  };
  aiForm?.addEventListener('submit', event => { event.preventDefault(); askAssistant(aiInput?.value); });
  $$('[data-ai-question]').forEach(button => button.addEventListener('click', () => askAssistant(button.dataset.aiQuestion)));

  /* Privacy-safe analytics hooks and optional owner console */
  const analyticsKey = 'rifat-portfolio-analytics';
  const readAnalytics = () => { try { return JSON.parse(localStorage.getItem(analyticsKey) || '[]'); } catch (error) { return []; } };
  const writeAnalytics = events => { try { localStorage.setItem(analyticsKey, JSON.stringify(events.slice(-200))); } catch (error) { /* storage may be disabled */ } };
  const trackEvent = detail => { const event = { name: String(detail?.name || 'interaction'), label: String(detail?.label || '').slice(0, 80), at: new Date().toISOString() }; const events = readAnalytics(); events.push(event); writeAnalytics(events); };
  document.addEventListener('rifat:track', event => trackEvent(event.detail || {}));
  trackEvent({ name: 'page_view', label: location.pathname });
  document.addEventListener('click', event => { const link = event.target.closest('a'); if (link?.href && link.href.includes('github.com')) trackEvent({ name: 'github_click', label: 'public_profile_or_repo' }); if (link?.href && link.href.includes('t.me')) trackEvent({ name: 'telegram_click', label: 'telegram_link' }); const projectPreview = event.target.closest('[data-preview]'); if (projectPreview) trackEvent({ name: 'project_preview', label: projectPreview.dataset.preview || 'project' }); });
  const analyticsConsole = $('#analytics-console');
  const analyticsQuery = new URLSearchParams(window.location.search);
  const analyticsEndpoint = analyticsConsole?.dataset.analyticsEndpoint?.trim();
  const renderAnalytics = async () => {
    if (!analyticsConsole) return;
    let stats = null;
    if (analyticsEndpoint) { try { const response = await fetch(analyticsEndpoint, { headers: { Accept: 'application/json' } }); if (response.ok) stats = await response.json(); } catch (error) { /* local mode remains available */ } }
    const events = readAnalytics();
    const count = name => stats?.[name] ?? events.filter(item => item.name === name).length;
    const visitsNode = $('#analytics-visits'); const projectNode = $('#analytics-projects'); const assistantNode = $('#analytics-assistant'); const terminalNode = $('#analytics-terminal');
    if (visitsNode) visitsNode.textContent = String(stats?.visits ?? count('page_view'));
    if (projectNode) projectNode.textContent = String(stats?.projectClicks ?? count('project_preview'));
    if (assistantNode) assistantNode.textContent = String(stats?.assistantQuestions ?? count('assistant_question'));
    if (terminalNode) terminalNode.textContent = String(stats?.terminalCommands ?? count('terminal_command'));
    const source = $('#analytics-source'); if (source) source.textContent = stats ? 'protected endpoint' : 'local browser mode';
    const recent = $('#analytics-recent');
    const recentEvents = Array.isArray(stats?.recent) ? stats.recent : events.slice(-8).reverse();
    if (recent) recent.innerHTML = recentEvents.length ? recentEvents.map(item => `<p><span>${item.name}</span><small>${item.at ? new Date(item.at).toLocaleString() : 'aggregate signal'}</small></p>`).join('') : '<p class="small-note">No local events recorded yet.</p>';
    const note = $('#analytics-console-note'); if (note && analyticsEndpoint && !stats) note.textContent = 'The configured analytics endpoint did not respond; local browser mode is shown.';
  };
  if (analyticsConsole && analyticsQuery.get('analytics') === '1') { analyticsConsole.hidden = false; renderAnalytics(); }

  /* Newsletter / Build Notes form — optional provider endpoint, mailto fallback */
  const newsletterForm = $('#newsletter-form');
  const newsletterStatus = $('#newsletter-status');
  newsletterForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const email = String(new FormData(newsletterForm).get('email') || '').trim();
    if (!email || !email.includes('@')) { if (newsletterStatus) newsletterStatus.textContent = isBn() ? 'সঠিক email address দিন।' : 'Please enter a valid email address.'; return; }
    const endpoint = (newsletterForm.dataset.newsletterEndpoint || '').trim();
    if (endpoint) { if (newsletterStatus) newsletterStatus.textContent = isBn() ? 'আপনার subscription save করা হচ্ছে…' : 'Saving your subscription…'; try { const response = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'Build Notes' }) }); if (!response.ok) throw new Error('Subscription failed');       newsletterForm.reset(); if (newsletterStatus) newsletterStatus.textContent = isBn() ? 'আপনি Build Notes list-এ যুক্ত হয়েছেন।' : 'You are on the Build Notes list.'; trackEvent({ name: 'newsletter_subscribe' }); return;     } catch (error) { if (newsletterStatus) newsletterStatus.textContent = isBn() ? 'Provider unavailable; email request খোলা হচ্ছে।' : 'Provider unavailable; opening an email request instead.'; } }
    window.location.href = `mailto:rashidulislamrifat14708@gmail.com?subject=${encodeURIComponent('Build Notes subscription')}&body=${encodeURIComponent(`Please add ${email} to the Build Notes list.`)}`;
  });

  /* Theme and language preferences */
  const themeToggle = $('#theme-toggle');
  const languageToggle = $('#language-toggle');
  const savedTheme = localStorage.getItem('rifat-theme');
  const applyTheme = theme => { document.documentElement.dataset.theme = theme; localStorage.setItem('rifat-theme', theme); if (themeToggle) { themeToggle.setAttribute('aria-pressed', String(theme === 'light')); themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'); themeToggle.textContent = theme === 'light' ? '☾' : '☼'; } };
  applyTheme(savedTheme === 'light' ? 'light' : 'dark');
  themeToggle?.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));
  const bnPhraseMap = {
    'Home':'হোম','Sections':'সেকশনসমূহ','About':'সম্পর্কে','Services':'সেবাসমূহ','Work':'কাজ','Case studies':'কেস স্টাডি','Proof':'প্রমাণ','Notes':'নোট','Contact':'যোগাযোগ','Build Notes':'বিল্ড নোটস','Process':'প্রক্রিয়া','Hire Me':'আমাকে নিয়োগ করুন','Skip to content':'মূল কনটেন্টে যান','Open menu':'মেনু খুলুন','Close menu':'মেনু বন্ধ করুন','Primary navigation':'প্রধান নেভিগেশন','Quick contact links':'দ্রুত যোগাযোগের লিংক','Display and language tools':'ডিসপ্লে ও ভাষা টুল','Switch to light theme':'লাইট থিমে যান','Switch to dark theme':'ডার্ক থিমে যান','Switch to Bengali':'বাংলায় যান','Switch to English':'ইংরেজিতে যান','Available for selected collaborations':'নির্বাচিত collaboration-এর জন্য available','Building':'তৈরি করি','useful':'উপযোগী','Telegram AI Bots':'Telegram AI বট','LLM Systems':'LLM সিস্টেম','Responsive Web Apps':'responsive web app','Agentic AI Workflows':'agentic AI workflow','System status':'সিস্টেমের অবস্থা','Available for focused collaborations':'focused collaboration-এর জন্য available','Where the work leads':'কাজের লক্ষ্য','I turn complex AI ideas into practical systems people can use.':'আমি জটিল AI idea-কে ব্যবহারযোগ্য practical system-এ রূপ দিই।','A featured deployment':'একটি উল্লেখযোগ্য deployment','Explore my work':'আমার কাজ দেখুন','See services →':'সেবাগুলো দেখুন →','3+ shipped projects. No signup needed.':'৩টির বেশি shipped project। signup প্রয়োজন নেই।','Built with care, tested in the real world.':'যত্নসহকারে তৈরি, বাস্তব ব্যবহারে tested।','Narsingdi, Bangladesh · UTC +6':'নরসিংদী, বাংলাদেশ · UTC +৬','Profile portrait':'প্রোফাইল portrait','Personal brand':'ব্যক্তিগত brand','AVAILABLE':'AVAILABLE','Available':'AVAILABLE','Three ways to explore the work':'কাজ দেখার তিনটি পথ','See all projects →':'সব project দেখুন →','Telegram storage & retrieval':'Telegram storage ও retrieval','Conversational AI interface':'conversational AI interface','Single-page web experience':'single-page web experience','Telegram AI bots':'Telegram AI bot','Useful systems, not demos.':'শুধু demo নয়, ব্যবহারযোগ্য system।','From model to interface.':'model থেকে interface পর্যন্ত।','Open for focused work':'focused কাজের জন্য open','The engineer behind the systems':'system-এর পেছনের engineer','I turn ambitious ideas into':'আমি ambitious idea-কে','useful software.':'ব্যবহারযোগ্য software-এ রূপ দিই।','Useful by design':'design-এ usefulness','I start with the real problem, not the loudest feature.':'আমি flashy feature নয়, বাস্তব problem দিয়ে শুরু করি।','Clear by default':'শুরু থেকেই clear','I shape complex systems into interfaces people can understand.':'জটিল system-কে এমন interface-এ রূপ দিই যা মানুষ বুঝতে পারে।','Built to ship':'ship করার মতো build','I care about dependable delivery, thoughtful details, and steady iteration.':'নির্ভরযোগ্য delivery, thoughtful detail এবং steady iteration-কে গুরুত্ব দিই।','shipped projects':'shipped project','core language':'মূল language','AI architecture':'AI architecture','Explore my capabilities':'আমার capabilities দেখুন','Open to focused collaborations':'focused collaboration-এর জন্য open','Start a conversation':'কথা শুরু করুন','Ready for hiring':'hiring-এর জন্য ready','What I can build':'আমি যা build করতে পারি','Practical systems, shaped for':'বাস্তব কাজের জন্য গড়া','real work.':'প্রয়োজনীয় system।','Choose a starting point or bring a workflow that needs a clearer, more useful shape. I work from the problem outward, keeping the first version focused and ready to grow.':'একটি starting point বেছে নিন অথবা এমন workflow নিয়ে আসুন যার আরও clear ও useful shape প্রয়োজন। আমি problem থেকে শুরু করে focused এবং grow করার মতো first version তৈরি করি।','Useful assistants, document tools, search flows and conversational bots that live where your users already work.':'আপনার user যেখানে কাজ করেন, সেখানেই useful assistant, document tool, search flow ও conversational bot তৈরি করি।','Bot flows':'Bot flow','Document search':'Document search','Admin tools':'Admin tool','Purpose-built OpenRouter and DeepSeek workflows with prompt design, sensible fallbacks and human-readable results.':'prompt design, sensible fallback ও human-readable result সহ purpose-built OpenRouter এবং DeepSeek workflow তৈরি করি।','RAG flows':'RAG flow','Prompt design':'Prompt design','Small utilities that remove repetitive work, protect important state and make everyday operations easier to repeat.':'repetitive কাজ কমায়, গুরুত্বপূর্ণ state সুরক্ষিত রাখে এবং everyday কাজ repeatable করে—এমন ছোট utility তৈরি করি।','File systems':'File system','Backups':'Backup','Editorial landing pages, portfolios and focused web experiences with clear hierarchy, responsive behavior and deliberate motion.':'clear hierarchy, responsive behavior ও deliberate motion সহ editorial landing page, portfolio এবং focused web experience তৈরি করি।','Canvas UI':'Canvas UI','Best for':'যাদের জন্য উপযোগী','Founders, small teams and independent builders who need a practical first version without unnecessary noise.':'Founder, ছোট team এবং independent builder—যাদের অপ্রয়োজনীয় noise ছাড়া practical first version প্রয়োজন।','Discuss a build →':'একটি build নিয়ে আলোচনা করুন →','Try the toolkit':'toolkit পরীক্ষা করুন','Six ways I build':'আমি যেভাবে build করি তার ছয়টি পথ','useful systems.':'ব্যবহারযোগ্য system।','Different product questions need different engineering paths. Choose a track to see how I approach the work, from first scope to a stable interface people can actually use.':'ভিন্ন product question-এর জন্য ভিন্ন engineering path প্রয়োজন। প্রথম scope থেকে ব্যবহারযোগ্য stable interface পর্যন্ত আমি কীভাবে কাজ করি তা দেখতে একটি track বেছে নিন।','The build arc':'build-এর ধাপ','Map the system':'system map করি','Connect intelligence':'intelligence connect করি','Remove the repeat':'repeat কাজ সরাই','Shape the experience':'experience shape করি','Go further':'আরও এগিয়ে','Ship with confidence':'confidence-এর সঙ্গে ship করি','Build together':'একসঙ্গে build করি','A clear system before a clever feature':'clever feature-এর আগে clear system','Architecture that stays understandable.':'বোঝা যায় এমন architecture।','I break a product into dependable layers—interfaces, data, integrations, and access rules—so a project can grow without becoming fragile.':'আমি product-কে dependable interface, data, integration ও access rule layer-এ ভাগ করি, যাতে project fragile না হয়ে grow করতে পারে।','Discuss an architecture →':'architecture নিয়ে আলোচনা করুন →','Models are components, not the product':'model একটি component, product নয়','LLM integrations built around purpose.':'উদ্দেশ্যকে কেন্দ্র করে LLM integration।','I connect OpenRouter, DeepSeek R1, and other model APIs to workflows that have useful prompts, clear fallbacks, and a human-readable result.':'useful prompt, clear fallback এবং human-readable result সহ workflow-এ OpenRouter, DeepSeek R1 ও অন্যান্য model API connect করি।','See the AI bot work →':'AI bot-এর কাজ দেখুন →','Make repetitive work disappear':'repetitive কাজ অদৃশ্য করি','Small utilities with a large payoff.':'ছোট utility, বড় ফলাফল।','From file indexing to scheduled backups and reading progress, I build Python utilities that reduce friction and keep the important state safe.':'file indexing, scheduled backup ও reading progress-এর মতো Python utility তৈরি করি যা friction কমায় এবং গুরুত্বপূর্ণ state নিরাপদ রাখে।','Automate a workflow →':'একটি workflow automate করুন →','A fast interface should still feel considered':'দ্রুত interface-ও thoughtful হওয়া উচিত','Frontend work with editorial polish.':'editorial polish সহ frontend কাজ।','I use HTML, modern CSS, and vanilla JavaScript to create responsive interfaces with deliberate motion, clear hierarchy, and accessible interactions.':'HTML, modern CSS ও vanilla JavaScript দিয়ে deliberate motion, clear hierarchy এবং accessible interaction সহ responsive interface তৈরি করি।','See this portfolio →':'এই portfolio দেখুন →','A project is not finished at the first demo':'প্রথম demo-তেই project শেষ নয়','Delivery that respects the real world.':'বাস্তব জগতকে সম্মান করা delivery।','I care about deployment paths, readable code, performance, and the small handover details that make a project easier to maintain.':'deployment path, readable code, performance এবং project maintain করা সহজ করে এমন handover detail-কে গুরুত্ব দিই।','Review the process →':'process দেখুন →','A strong build starts with a shared picture':'একটি strong build shared picture দিয়ে শুরু হয়','Collaboration without unnecessary noise.':'অপ্রয়োজনীয় noise ছাড়া collaboration।','I begin by clarifying the goal, constraints, and success criteria, then keep communication focused while the product takes shape.':'goal, constraint ও success criteria clear করে শুরু করি, তারপর product shape নেওয়ার সময় communication focused রাখি।','Let’s collaborate →':'চলুন একসঙ্গে কাজ করি →','Rifat’s build notes.':'Rifat-এর build notes।','Every tool has a purpose →':'প্রতিটি tool-এর একটি purpose আছে →','Selected deployments':'নির্বাচিত deployment','Work that moved from':'যে কাজ এগিয়েছে','idea to interface.':'idea থেকে interface পর্যন্ত।','A small portfolio, deliberately focused on systems I have actually designed, built, tested, and shipped.':'আমি সত্যিই design, build, test ও ship করেছি—এমন system-কে কেন্দ্র করে তৈরি একটি focused portfolio।','Filter the archive':'archive filter করুন','All':'সব','AI / LLM':'AI / LLM','Frontend':'frontend','Telegram':'Telegram','View case study ↗':'case study দেখুন ↗','Search. Retrieve. Ship.':'Search করুন। Retrieve করুন। Ship করুন।','Shipped':'Shipped','Telegram-based PDF storage and retrieval with smart categorization, fuzzy search, reading progress tracking, and automated backups running on Termux.':'Termux-এ চলা smart categorization, fuzzy search, reading progress ও automated backup সহ Telegram-based PDF storage ও retrieval system।','Live bot + public source code.':'Live bot + public source code।','Live Bot ↗':'Live Bot ↗','Source Code ↗':'Source Code ↗','Connect model to moment.':'model-কে মুহূর্তের সঙ্গে connect করি।','In progress':'চলমান কাজ','A conversational Telegram chatbot integrating DeepSeek R1 through OpenRouter API for real-time AI conversations inside Telegram.':'OpenRouter API-এর মাধ্যমে DeepSeek R1 integrate করা conversational Telegram chatbot, যা Telegram-এর ভেতরে real-time AI conversation চালায়।','Active build plan; source release follows completion.':'Active build plan; completion-এর পরে source release হবে।','Source code coming soon':'Source code শীঘ্রই আসছে','Make the interface memorable.':'interface-কে memorable করি।','Live interface + public source code.':'Live interface + public source code।','Live Demo ↗':'Live Demo ↗','See the system in motion':'system-কে motion-এ দেখুন','A Telegram archive that feels':'যে Telegram archive মনে হয়','searchable.':'সহজে searchable।','Before a client opens Telegram, this small interactive preview shows the core loop: search a library, retrieve a file, and keep the system useful under everyday pressure.':'client Telegram খোলার আগে এই ছোট interactive preview core loop দেখায়: library search, file retrieve এবং everyday pressure-এ system useful রাখা।','Document vault · Telegram workflow':'document vault · Telegram workflow','Public demo':'public demo','Welcome back. What would you like to find?':'আবার স্বাগতম। কী খুঁজতে চান?','Search for “MRI workflow”':'“MRI workflow” খুঁজুন','12 results found.':'১২টি result পাওয়া গেছে।','Showing the closest matches with title, category and reading progress.':'title, category ও reading progress অনুযায়ী সবচেয়ে কাছের match দেখানো হচ্ছে।','Search PDFs':'PDF search করুন','Retrieve a file':'একটি file retrieve করুন','Show backup flow':'backup flow দেখান','Simulated walkthrough · no Telegram message is sent from this preview.':'Simulated walkthrough · এই preview থেকে কোনো Telegram message পাঠানো হয় না।','What the client sees':'client যা দেখেন','Less friction between a document and the moment it matters.':'document এবং প্রয়োজনের মুহূর্তের মধ্যে কম friction।','Fuzzy search, categorisation, reading progress and automated backups are presented as one calm workflow. The live bot remains one click away when the preview has done its job.':'fuzzy search, categorisation, reading progress ও automated backup-কে একটি calm workflow হিসেবে দেখানো হয়েছে। preview-এর কাজ শেষ হলে live bot এক click দূরে।','Link status':'link status','Open in Telegram':'Telegram-এ খুলুন','Monitoring endpoint not configured':'monitoring endpoint configured নয়','Open the live bot →':'live bot খুলুন →','Optional uptime monitoring can be connected later through a public JSON status endpoint; no uptime percentage is invented here.':'public JSON status endpoint-এর মাধ্যমে পরে optional uptime monitoring যুক্ত করা যাবে; এখানে কোনো uptime percentage বানিয়ে দেখানো হয়নি।','Before / after':'আগে / পরে','The value is in the':'মূল value হলো','friction removed.':'যে friction সরানো হয়েছে।','A project story is more useful when it shows the change in the workflow—not only the feature list.':'project story তখনই বেশি useful হয় যখন feature list নয়, workflow-এর পরিবর্তনও দেখায়।','Before · manual retrieval':'আগে · manual retrieval','Remember the filename. Search through folders. Lose the thread.':'filename মনে রাখুন। folder ঘেঁটে search করুন। context হারান।','Important PDFs lived in a growing library where imperfect memory made retrieval slow and repeatable work easy to postpone.':'গুরুত্বপূর্ণ PDF বড় হতে থাকা library-তে ছিল, যেখানে অসম্পূর্ণ স্মৃতির কারণে retrieval ধীর এবং repeat কাজ পিছিয়ে যেত।','After · MRI Vault workflow':'পরে · MRI Vault workflow','Search by intent. Retrieve the file. Continue the work.':'উদ্দেশ্য অনুযায়ী search করুন। file retrieve করুন। কাজ চালিয়ে যান।','Telegram, fuzzy matching, metadata, reading progress and backups turn storage into a calmer, searchable system.':'Telegram, fuzzy matching, metadata, reading progress ও backup storage-কে আরও calm ও searchable system-এ রূপ দেয়।','How I think through a build':'আমি যেভাবে build নিয়ে ভাবি','From problem to':'problem থেকে','proof.':'proof পর্যন্ত।','A deeper look at the decisions behind each project: what made the problem real, which trade-offs mattered, and how the first useful version took shape.':'প্রতিটি project-এর পেছনের decision, বাস্তব problem, গুরুত্বপূর্ণ trade-off এবং first useful version কীভাবে তৈরি হয়েছে তার গভীর look।','Problem':'Problem','Thinking':'Thinking','Technical decision':'Technical decision','Challenge':'Challenge','Solution':'Solution','Outcome':'Outcome','Open visual case study ↗':'visual case study খুলুন ↗','Open project link →':'project link খুলুন →','Interactive architecture':'interactive architecture','See how the':'দেখুন কীভাবে','pieces connect.':'piece-গুলো connect হয়।','A compact map of the MRI Vault pattern: interface, state, search, storage and recovery working as one understandable system.':'MRI Vault pattern-এর compact map: interface, state, search, storage ও recovery একটি understandable system হিসেবে কাজ করে।','Interface':'Interface','Decision layer':'decision layer','Durable state':'durable state','Recovery path':'recovery path','Technical proof':'technical proof','Show the decisions behind the':'দেখুন interface-এর পেছনের','interface.':'decision-গুলো।','Clients and recruiters can inspect the trade-offs, failure handling, security posture and lessons learned—not only the polished surface.':'client এবং recruiter polished surface নয়, trade-off, failure handling, security posture ও lessons learned-ও দেখতে পারবেন।','Demo / workflow':'demo / workflow','SEARCH → RETRIEVE':'SEARCH → RETRIEVE','Search:':'Search:','Ranked by fuzzy match, category and progress.':'fuzzy match, category ও progress অনুযায়ী ranked।','Backup path ready':'backup path ready','Safe embedded preview · no external Telegram session or private data is loaded.':'safe embedded preview · কোনো external Telegram session বা private data load করা হয়নি।','Trade-offs / failure handling':'trade-off / failure handling','Useful systems stay understandable when the happy path breaks.':'happy path break করলেও useful system understandable থাকে।','Decision':'decision','Keep Telegram as the low-friction interface and SQLite as durable local state.':'Telegram-কে low-friction interface এবং SQLite-কে durable local state হিসেবে রাখি।','Failure path':'failure path','Use readable fallback messages, preserve user state and make backup/recovery behavior explicit.':'readable fallback message ব্যবহার করি, user state রাখি এবং backup/recovery behavior স্পষ্ট করি।','Security':'security','Never expose tokens in static files; keep external endpoints optional and server-configured.':'static file-এ token কখনও expose করি না; external endpoint optional ও server-configured রাখি।','Lesson':'lesson','Ship one complete workflow first, then expand only when real usage reveals the next constraint.':'আগে একটি complete workflow ship করি, real usage পরবর্তী constraint দেখালে expand করি।','Public work signal':'public work signal','A live window into the':'আমার workbench-এর live window','workbench.':'','This widget reads public GitHub repository data in the browser. It shows a current snapshot of shipped work and recent repository movement without pretending to expose private contribution data.':'এই widget browser-এ public GitHub repository data পড়ে। এটি shipped work ও recent repository movement-এর snapshot দেখায়, private contribution data দেখানোর ভান করে না।','GitHub / public snapshot':'GitHub / public snapshot','Loading…':'লোড হচ্ছে…','public repos':'public repo','stars received':'প্রাপ্ত star','followers':'follower','Fetching recently updated public repositories…':'সাম্প্রতিক updated public repository আনা হচ্ছে…','Loading public activity timeline…':'public activity timeline লোড হচ্ছে…','Open GitHub profile →':'GitHub profile খুলুন →','What this proves':'এতে যা প্রমাণ হয়','Activity with context, not a vanity counter.':'vanity counter নয়, context-সহ activity।','The snapshot counts public repositories, stars and recent update signals. Exact contribution graphs require authenticated GitHub access, so this widget stays within what the public API can verify.':'snapshot public repository, star ও recent update signal count করে। exact contribution graph-এর জন্য authenticated GitHub access প্রয়োজন, তাই widget public API যা verify করতে পারে তার মধ্যেই থাকে।','Data source':'data source','Open-source timeline':'open-source timeline','A clearer trail from repo to':'repo থেকে','release.':'release পর্যন্ত clear trail।','A structured public-work signal: repository, current state, documentation, reusable utilities and the next visible milestone.':'repository, current state, documentation, reusable utility ও পরবর্তী visible milestone-এর structured public-work signal।','Repository ↗':'repository ↗','Active build':'active build','Release follows completion':'completion-এর পরে release','Reusable practice':'reusable practice','Field notes':'field notes','Small observations from':'ছোট observation','the build.':'build-এর','Short technical notes about the decisions behind the work. They are intentionally compact: useful enough to start a conversation, open enough to invite a deeper one.':'কাজের পেছনের decision নিয়ে ছোট technical note। conversation শুরু করার মতো useful, কিন্তু আরও আলোচনার জন্য open।','Search systems':'search system','How I approach fuzzy search inside a Telegram archive':'Telegram archive-এ fuzzy search যেভাবে করি','Search becomes useful when a person does not need to remember the exact title. I think about the user’s imperfect query first, then combine normalised text, close matches and useful metadata so the result feels forgiving without becoming mysterious.':'কাউকে exact title মনে রাখতে না হলে search useful হয়। user-এর imperfect query আগে ভাবি, তারপর normalised text, close match ও useful metadata মিলিয়ে forgiving কিন্তু understandable result তৈরি করি।','Build environment':'build environment','Why Termux is part of my engineering practice':'Termux কেন আমার engineering practice-এর অংশ','Working across Android and Windows keeps the engineering question honest: can the system run, recover and remain understandable outside a perfect setup? Termux makes that constraint visible, which often leads to simpler choices and clearer handover notes.':'Android ও Windows দু জায়গায় কাজ করলে engineering question বাস্তব থাকে: perfect setup-এর বাইরে system কি run, recover ও understandable থাকতে পারে? Termux সেই constraint স্পষ্ট করে এবং simpler choice ও clearer handover note-এর দিকে নিয়ে যায়।','LLM workflows':'LLM workflow','The practical layer between a model and a useful product':'model ও useful product-এর মাঝের practical layer','An LLM is a component, not the product. The useful layer is the workflow around it: a focused prompt, predictable fallbacks, a place for state, and an interface that makes the answer understandable enough to act on.':'LLM একটি component, product নয়। useful layer হলো এর চারপাশের workflow: focused prompt, predictable fallback, state রাখার জায়গা এবং action নেওয়ার মতো understandable interface।','Now building':'এখন build করছি','A visible trail of':'দৃশ্যমান trail','steady work.':'steady work-এর।','A small changelog keeps the portfolio honest: active work, the next milestone and what is deliberately still in progress.':'ছোট changelog portfolio-কে honest রাখে: active work, next milestone এবং ইচ্ছাকৃতভাবে in progress থাকা অংশ।','Active':'active','Maintained':'maintained','Adding proof, accessible interactions and clear pathways for the next collaboration.':'proof, accessible interaction ও পরবর্তী collaboration-এর clear pathway যোগ করছি।','Command surface':'command surface','Try the studio':'studio পরীক্ষা করুন','from the prompt.':'prompt থেকে।','A small command-line directory for visitors who prefer to explore through the same `rifat@studio:~$` language used across the portfolio.':'যারা command line পছন্দ করেন তাদের জন্য ছোট directory—portfolio-তে ব্যবহৃত `rifat@studio:~$` language-এই explore করুন।','interactive portfolio shell':'interactive portfolio shell','Available commands:':'available command:','Type a terminal command':'terminal command লিখুন','Run':'চালান','Commands are simulated locally; no system access is requested.':'command local-ভাবে simulated; কোনো system access চাওয়া হয় না।','Compare the work':'কাজ compare করুন','Choose a system. See the':'একটি system বেছে দেখুন','shape.':'তার shape।','Compare the three public project directions by problem, stack, status and proof path.':'problem, stack, status ও proof path অনুযায়ী তিনটি public project direction compare করুন।','Project to inspect':'যে project দেখবেন','Primary problem':'মূল problem','Document retrieval':'document retrieval','Status':'status','Proof path':'proof path','Download comparison':'comparison download করুন','Copy shareable link':'shareable link copy করুন','Project fit 2.0':'Project fit ২.০','Start with the':'শুরু করুন','right question.':'সঠিক প্রশ্ন দিয়ে।','Share the shape of the project and get a practical service recommendation, starting scope and relevant case study—not a vague service list.':'project-এর shape জানিয়ে practical service recommendation, starting scope ও relevant case study পান—vague service list নয়।','What are you trying to improve?':'আপনি কী improve করতে চান?','A Telegram workflow':'একটি Telegram workflow','An LLM-powered feature':'একটি LLM-powered feature','A repetitive process':'একটি repetitive process','A web interface':'একটি web interface','Where are you now?':'আপনার বর্তমান অবস্থান কী?','Just an idea':'শুধু একটি idea','Prototype exists':'prototype আছে','Already live':'ইতিমধ্যে live','What budget shape should we design around?':'কোন budget range ধরে design করব?','Lean first version · under $300':'lean first version · $300-এর কম','Focused build · $300–$750':'focused build · $300–$750','Growth build · $750+':'growth build · $750+','Not sure yet':'এখনও নিশ্চিত নয়','What is the deadline pressure?':'deadline pressure কেমন?','Flexible · quality first':'flexible · quality first','Within 1 month':'১ মাসের মধ্যে','Within 2 weeks':'২ সপ্তাহের মধ্যে','Where should it live?':'এটি কোথায় চলবে?','Web / responsive browser':'web / responsive browser','Telegram + web':'Telegram + web','Termux / self-hosted':'Termux / self-hosted','Which integration matters most?':'কোন integration সবচেয়ে গুরুত্বপূর্ণ?','LLM / AI API':'LLM / AI API','Files / search / storage':'file / search / storage','Automation / notifications':'automation / notification','No integration yet':'এখনও কোনো integration নেই','How complex is the first useful version?':'প্রথম useful version কতটা complex?','One focused workflow':'একটি focused workflow','Several connected workflows':'কয়েকটি connected workflow','A product foundation':'একটি product foundation','Build my recommendation →':'আমার recommendation তৈরি করুন →','Your recommendation will appear here.':'আপনার recommendation এখানে দেখা যাবে।','Answer the questions to see a realistic starting scope.':'বাস্তবসম্মত starting scope দেখতে প্রশ্নগুলোর উত্তর দিন।','Relevant case study →':'প্রাসঙ্গিক case study →','Interactive project brief':'interactive project brief','Turn a vague idea into a':'অস্পষ্ট idea-কে রূপ দিন','clear starting brief.':'একটি clear starting brief-এ।','Answer a few practical questions and generate a structured brief you can download, email or open in Telegram before the first conversation.':'কয়েকটি practical প্রশ্নের উত্তর দিয়ে first conversation-এর আগে download, email বা Telegram-এ পাঠানোর মতো structured brief তৈরি করুন।','Your name':'আপনার নাম','What should the project improve?':'project কী improve করবে?','Who will use it?':'কারা ব্যবহার করবেন?','What would success look like?':'success দেখতে কেমন হবে?','Constraints, integrations or notes':'constraint, integration বা note','Generate structured brief →':'structured brief তৈরি করুন →','Generated brief':'তৈরি করা brief','Your project story will appear here.':'আপনার project story এখানে দেখা যাবে।','Answer the questions and generate a brief to unlock the export and share actions.':'প্রশ্নগুলোর উত্তর দিয়ে brief তৈরি করলে export ও share action চালু হবে।','Download .txt':' .txt download করুন','Email brief':'brief email করুন','Performance posture':'performance posture','Built to stay':'portable থাকার জন্য তৈরি','portable.':'।','No invented score is published here. Instead, these are the verifiable implementation choices that keep the site ready for a real audit.':'এখানে কোনো invented score প্রকাশ করা হয়নি। পরিবর্তে audit-এর জন্য site ready রাখে এমন verifiable implementation choice দেখানো হয়েছে।','Local assets':'local asset','Project artwork, portrait and résumé paths are packaged with the site.':'project artwork, portrait ও résumé path site-এর সঙ্গে package করা আছে।','Progressive loading':'progressive loading','Non-critical project images use lazy loading and async decoding.':'non-critical project image lazy loading ও async decoding ব্যবহার করে।','Motion fallback':'motion fallback','Reduced-motion and Save-Data modes disable non-essential canvas activity.':'reduced-motion ও Save-Data mode non-essential canvas activity বন্ধ করে।','Accessible path':'accessible path','Keyboard focus rings, skip link, labelled forms and dialog focus return are included.':'keyboard focus ring, skip link, labelled form এবং dialog focus return যুক্ত আছে।','PWA shell':'PWA shell','Manifest metadata and a versioned service worker cache the core shell for repeat visits and offline fallback.':'manifest metadata ও versioned service worker repeat visit এবং offline fallback-এর জন্য core shell cache করে।','Verified feedback only':'শুধু verified feedback','Trust should be':'বিশ্বাস','earned.':'অর্জন করতে হয়।','I only publish feedback from people who have actually used the work.':'যারা সত্যিই কাজটি ব্যবহার করেছেন, শুধু তাদের feedback প্রকাশ করি।','There are no invented testimonials here. As beta users and collaborators share permissioned feedback, this section becomes a record of real outcomes rather than decorative praise.':'এখানে কোনো invented testimonial নেই। beta user ও collaborator permission দিলে এই section decorative praise নয়, real outcome-এর record হবে।','Share verified feedback →':'verified feedback share করুন →','Current availability':'বর্তমান availability','Accepting selected AI & web projects':'নির্বাচিত AI ও web project গ্রহণ করছি','Usually replies within 24–48 hours · Narsingdi, Bangladesh · UTC +6':'সাধারণত ২৪–৪৮ ঘণ্টার মধ্যে reply দিই · নরসিংদী, বাংলাদেশ · UTC +৬','Availability calendar':'availability calendar','A realistic view of the next':'পরবর্তী conversation-এর','conversation.':'বাস্তব চিত্র।','Current availability, the next opening and the response target are shown as a planning signal—not a guaranteed booking promise.':'current availability, next opening ও response target planning signal হিসেবে দেখানো হচ্ছে—guaranteed booking promise নয়।','August 2026':'আগস্ট ২০২৬','Open':'open','Focused':'focused','Sun':'রবি','Mon':'সোম','Tue':'মঙ্গল','Wed':'বুধ','Thu':'বৃহস্পতি','Fri':'শুক্র','Sat':'শনি','Current status':'বর্তমান status','Accepting selected projects':'নির্বাচিত project গ্রহণ করছি','AI bots, LLM workflows, Python automation and focused interfaces.':'AI bot, LLM workflow, Python automation ও focused interface।','Next open slot':'পরবর্তী open slot','18 August 2026':'১৮ আগস্ট ২০২৬','Discovery calls are arranged after a short project brief.':'ছোট project brief-এর পরে discovery call আয়োজন করা হয়।','Expected response':'সম্ভাব্য response','24–48 hours':'২৪–৪৮ ঘণ্টা','Send the goal, platform, constraints and desired first version.':'goal, platform, constraint ও desired first version পাঠান।','Prepare a project brief →':'project brief প্রস্তুত করুন →','Client portal preview':'client portal preview','A private space for the':'private space','active build.':'active build-এর জন্য।','This static-safe preview shows the intended client experience: brief, milestones, files and handover notes. Production authentication and private storage must be connected through a protected backend before confidential data is used.':'এই static-safe preview-তে client experience-এর কাঠামো দেখানো হয়েছে: brief, milestone, file ও handover note। confidential data ব্যবহারের আগে protected backend-এর মাধ্যমে production authentication ও private storage যুক্ত করতে হবে।','Open portal preview →':'portal preview খুলুন →','Rifat client workspace':'Rifat client workspace','DEMO ONLY':'শুধু DEMO','Overview':'overview','Milestones':'milestone','Handover':'handover','Active brief':'active brief','Focused first version: searchable PDF retrieval with a clear backup path.':'focused first version: clear backup path সহ searchable PDF retrieval।','Tools I work with':'যে tool-এ কাজ করি','A focused':'একটি focused','technical stack.':'technical stack।','Focus the stack':'stack focus করুন','AI':'AI','Backend':'backend','Tooling':'tooling','AI & LLM Systems':'AI ও LLM system','Strong working practice':'strong working practice','Used in':'ব্যবহৃত হয়েছে','and':'এবং','Backend & Database':'backend ও database','Production projects':'production project','Frontend Design':'frontend design','Shipped interface':'shipped interface','Tooling & Environment':'tooling ও environment','Daily practice':'প্রতিদিনের practice','Used across':'ব্যবহৃত হয়েছে','every case study':'প্রতিটি case study-তে','Stack constellation':'stack constellation','Tools with a purpose.':'উদ্দেশ্যপূর্ণ tool।','Every layer is chosen to make the final system clearer, faster, and more useful.':'প্রতিটি layer final system-কে আরও clear, fast ও useful করার জন্য বেছে নেওয়া।','The working method':'কাজের পদ্ধতি','A simple path from':'সহজ একটি পথ','scope to support.':'scope থেকে support পর্যন্ত।','Discovery & Scoping':'discovery ও scoping','Analyze the requirement, define the core architecture, and agree on what a successful first version should do.':'requirement analyze করি, core architecture define করি এবং successful first version কী করবে তা ঠিক করি।','Prototyping':'prototyping','Build an early MVP to validate API integrations, database structure, interaction patterns, and performance assumptions.':'API integration, database structure, interaction pattern ও performance assumption validate করতে early MVP build করি।','Development':'development','Write clean, maintainable Python and web code with a focus on reliability, accessibility, and asynchronous execution where it helps.':'reliability, accessibility ও প্রয়োজনমতো asynchronous execution-কে গুরুত্ব দিয়ে clean, maintainable Python ও web code লিখি।','Delivery & Support':'delivery ও support','Deploy the work with clear handover notes, then stay available for post-launch assistance and practical refinements.':'clear handover note সহ কাজ deploy করি, তারপর post-launch assistance ও practical refinement-এর জন্য available থাকি।','Clarifications':'clarification','Questions people':'মানুষের','usually ask.':'সাধারণ প্রশ্ন।','What types of projects do you take on?':'কোন ধরনের project নেন?','I focus on Telegram bots, Python automation tools, LLM API integrations, and modern responsive websites.':'আমি Telegram bot, Python automation tool, LLM API integration এবং modern responsive website-এ focus করি।','How experienced are you?':'আপনার experience কেমন?','I am a self-taught developer actively building my portfolio through real, shipped projects with a focus on reliability and clean code.':'আমি self-taught developer; reliability ও clean code-কে গুরুত্ব দিয়ে real, shipped project-এর মাধ্যমে portfolio তৈরি করছি।','Which LLM APIs do you integrate?':'কোন LLM API integrate করেন?','I work with OpenRouter API to integrate models such as DeepSeek R1 and GPT models into useful applications.':'আমি OpenRouter API ব্যবহার করে DeepSeek R1 ও GPT-এর মতো model useful application-এ integrate করি।','How do you usually start a project?':'সাধারণত project কীভাবে শুরু করেন?','We begin with the goal, constraints and first useful version. I then map the workflow, agree on scope and build a focused prototype before expanding the system.':'goal, constraint ও first useful version দিয়ে শুরু করি। তারপর workflow map, scope agree এবং system expand করার আগে focused prototype build করি।','Useful engineering notes,':'useful engineering note,','occasionally.':'মাঝে মাঝে।','A short, practical dispatch on Python automation, LLM workflows, Telegram systems and the decisions behind useful software. No artificial schedule and no noisy newsletter.':'Python automation, LLM workflow, Telegram system এবং useful software-এর পেছনের decision নিয়ে short practical dispatch। artificial schedule বা noisy newsletter নয়।','Join when the first public issue is ready.':'প্রথম public issue ready হলে যুক্ত হন।','Email address':'email address','Subscribe →':'subscribe করুন →','Direct subscription is ready for a provider endpoint. Until then, this opens a prepared email request.':'provider endpoint-এর জন্য direct subscription ready। তার আগে এটি prepared email request খুলবে।','Owner console':'owner console','A quiet view of the':'signals-এর','signals.':'শান্ত view।','Open this panel with':'এই panel খুলুন','Static mode shows only this browser’s locally stored events. Add a protected JSON endpoint for real site-wide analytics; never place admin credentials in client-side code.':'static mode শুধু এই browser-এর locally stored event দেখায়। real site-wide analytics-এর জন্য protected JSON endpoint যুক্ত করুন; client-side code-এ admin credential রাখবেন না।','local browser mode':'local browser mode','recorded visits':'recorded visit','project clicks':'project click','assistant questions':'assistant question','terminal commands':'terminal command','No local events recorded yet.':'এখনও কোনো local event record হয়নি।','For real traffic analytics, connect a privacy-conscious provider or protected endpoint.':'real traffic analytics-এর জন্য privacy-conscious provider বা protected endpoint connect করুন।','Get in touch':'যোগাযোগ করুন','Let’s build something':'চলুন তৈরি করি','exceptional.':'অসাধারণ কিছু।','Have a project idea, a workflow worth automating, or a product that needs a sharper interface? Send a message directly or find me through the links below. I usually reply within 24–48 hours.':'কোনো project idea, automate করার মতো workflow অথবা sharper interface প্রয়োজন এমন product আছে? সরাসরি message পাঠান বা নিচের link-এ আমাকে খুঁজে নিন। সাধারণত ২৪–৪৮ ঘণ্টার মধ্যে reply দিই।','WhatsApp: +880 1737-608355':'WhatsApp: +৮৮০ ১৭৩৭-৬০৮৩৫৫','Copy email address':'email address copy করুন','Download résumé (PDF)':'résumé (PDF) download করুন','Project type':'project type','Select a project type':'project type select করুন','Telegram AI Bot':'Telegram AI Bot','LLM / RAG Integration':'LLM / RAG integration','Responsive Website':'responsive website','Other / Not sure yet':'অন্য / এখনও নিশ্চিত নয়','Budget range':'budget range','Select a budget range':'budget range select করুন','Under $100':'$১০০-এর কম','$100–$300':'$১০০–$৩০০','$300–$750':'$৩০০–$৭৫০','$750+':'$৭৫০+','Let’s discuss scope first':'আগে scope নিয়ে আলোচনা করি','Subject':'subject','Message':'message','Send project brief →':'project brief পাঠান →','A direct provider endpoint can send the brief to email or a Telegram notification. Until configured, this opens a prepared email draft.':'direct provider endpoint brief email বা Telegram notification-এ পাঠাতে পারে। configure না করা পর্যন্ত prepared email draft খুলবে।','Explore':'explore','Connect':'connect','LinkedIn · add URL':'LinkedIn · URL যোগ করুন','A note from the builder':'builder-এর একটি note','I build with curiosity, automate with purpose, and shape every interface to make complex work feel simple.':'আমি curiosity নিয়ে build করি, purpose নিয়ে automate করি এবং complex কাজকে simple মনে হয় এমন interface তৈরি করি।','— MD Rashidul Islam (Rifat)':'— MD Rashidul Islam (Rifat)','Built with intention, clean code, and a practical bias toward useful software.':'intention, clean code এবং useful software-এর practical bias নিয়ে তৈরি।','Ask about the work':'কাজ সম্পর্কে জিজ্ঞেস করুন','Rifat’s project assistant':'Rifat-এর project assistant','Local project knowledge · no private data':'local project knowledge · private data নেই','Ask about Telegram bots, LLM integrations, the MRI Vault, or the engineering approach behind this portfolio.':'Telegram bot, LLM integration, MRI Vault অথবা এই portfolio-এর engineering approach সম্পর্কে জিজ্ঞেস করুন।','What can you build?':'আপনি কী build করতে পারেন?','How was the MRI Vault built?':'MRI Vault কীভাবে build করা হয়েছে?','What skills do you use?':'কোন skill ব্যবহার করেন?','Ask a question about Rifat’s work':'Rifat-এর কাজ সম্পর্কে প্রশ্ন করুন','Send':'পাঠান','Local retrieval mode is active. Add a secure server endpoint to enable generative AI responses.':'local retrieval mode active। generative AI response চালু করতে secure server endpoint যোগ করুন।'
  };
  Object.assign(bnPhraseMap, {
    'This portfolio uses a small amount of JavaScript for interactive previews. The core profile, services, projects and contact links remain available without it.':'এই portfolio interactive preview-এর জন্য অল্প JavaScript ব্যবহার করে। JavaScript ছাড়া core profile, services, project ও contact link available থাকে।',
    'AI Systems & Full-Stack Engineer':'AI Systems ও Full-Stack Engineer','I’m MD Rashidul Islam (Rifat), a self-taught Full-Stack AI Engineer from Narsingdi, Bangladesh. I turn complex AI ideas, automation workflows, and interface problems into practical software people can use.':'আমি MD Rashidul Islam (Rifat), নরসিংদী, বাংলাদেশের self-taught Full-Stack AI Engineer। জটিল AI idea, automation workflow ও interface problem-কে ব্যবহারযোগ্য software-এ রূপ দিই।','MD Rashidul Islam (Rifat) — a self-taught Full-Stack AI Engineer building useful Telegram bots, LLM integrations, automation systems, and responsive web interfaces.':'MD Rashidul Islam (Rifat) — self-taught Full-Stack AI Engineer হিসেবে useful Telegram bot, LLM integration, automation system ও responsive web interface তৈরি করি।','Available for selected collaborations.':'নির্বাচিত collaboration-এর জন্য available।','conversational AI interface':'conversational AI interface','single-page web experience':'single-page web experience','init portfolio --interactive':'portfolio --interactive চালু করছি','My work sits where engineering discipline meets product clarity: Python and SQLite on the backend, modern HTML, CSS and JavaScript on the frontend, and API-first AI systems in between. Working across Android through Termux and a Windows workspace has taught me to value clear architecture, reliable behavior, and software people can genuinely use.':'আমার কাজ engineering discipline ও product clarity-এর সংযোগস্থলে: backend-এ Python ও SQLite, frontend-এ modern HTML, CSS ও JavaScript এবং মাঝখানে API-first AI system। Termux-সহ Android ও Windows-এ কাজ করার অভিজ্ঞতা clear architecture, reliable behavior ও genuinely useful software-এর মূল্য শিখিয়েছে।','engineer.profile.json':'engineer.profile.json','"MD Rashidul Islam (Rifat)"':'"MD Rashidul Islam (Rifat)"','"Full-Stack AI Engineer"':'"Full-Stack AI Engineer"','"Narsingdi, Bangladesh"':'"নরসিংদী, বাংলাদেশ"','"Telegram Bot Architecture"':'"Telegram Bot Architecture"','"LLM API Orchestration"':'"LLM API Orchestration"','"Python Automation Utilities"':'"Python Automation Utilities"','"Full-Stack Web Interfaces"':'"Full-Stack Web Interfaces"','PYTHON / AUTOMATION':'PYTHON / AUTOMATION','Responsive Web Interfaces':'Responsive Web Interface','A single-page portfolio experience with a custom editorial layout, interactive project rail, animated dust field, responsive navigation, tabbed capabilities, and thoughtful motion built without a framework.':'custom editorial layout, interactive project rail, animated dust field, responsive navigation, tabbed capability ও thoughtful motion সহ framework-বিহীন single-page portfolio experience।','Live bot + public source code।':'Live bot + public source code।','Live interface + public source code।':'Live interface + public source code।','document vault · Telegram workflow':'document vault · Telegram workflow','A document workflow designed around the moment a file needs to be found, not merely stored.':'শুধু store নয়, file খুঁজে পাওয়ার মুহূর্তকে কেন্দ্র করে design করা document workflow।','A growing PDF library was becoming harder to search, organise and revisit.':'বড় হতে থাকা PDF library search, organise ও revisit করা কঠিন হয়ে উঠছিল।','Start where the user already works, then remove the repeated steps that slow retrieval down.':'user যেখানে কাজ করেন সেখান থেকেই শুরু করে retrieval ধীর করা repeated step সরানো।','Use Telegram as the interface, SQLite for durable state, and fuzzy matching for forgiving search.':'interface হিসেবে Telegram, durable state-এর জন্য SQLite এবং forgiving search-এর জন্য fuzzy matching ব্যবহার করা।','Keep metadata, file storage, progress and backup behaviour coherent inside a small self-hosted system.':'ছোট self-hosted system-এর মধ্যে metadata, file storage, progress ও backup behavior coherent রাখা।','A focused bot workflow with categorisation, fuzzy search, reading progress and automated backups.':'categorisation, fuzzy search, reading progress ও automated backup সহ focused bot workflow।','A live, usable document vault that turns Telegram into a practical retrieval interface.':'Telegram-কে practical retrieval interface-এ রূপ দেওয়া live ও usable document vault।','interactive architecture':'interactive architecture','Telegram interface connected to bot logic, SQLite state, fuzzy search, document storage and automated backups.':'Telegram interface bot logic, SQLite state, fuzzy search, document storage ও automated backup-এর সঙ্গে connected।','trade-off / failure handling':'trade-off / failure handling','GitHub / public snapshot':'GitHub / public snapshot','open-source timeline':'open-source timeline','Telegram archive workflow with fuzzy search, SQLite state, reading progress and backup behavior.':'fuzzy search, SQLite state, reading progress ও backup behavior সহ Telegram archive workflow।','DeepSeek R1 through OpenRouter, with response clarity, fallback planning and a focused chat loop.':'response clarity, fallback planning ও focused chat loop সহ OpenRouter-এর মাধ্যমে DeepSeek R1।','Static HTML, CSS and JavaScript patterns for accessible dialogs, filtering, PWA caching and honest analytics.':'accessible dialog, filter, PWA cache ও honest analytics-এর জন্য static HTML, CSS ও JavaScript pattern।','Connecting a focused Telegram conversation flow to DeepSeek R1 through OpenRouter.':'OpenRouter-এর মাধ্যমে focused Telegram conversation flow-কে DeepSeek R1-এর সঙ্গে connect করছি।','Next milestone · refine response flow and publish source when ready.':'পরবর্তী milestone · response flow refine করে ready হলে source publish করা।','Keeping search, retrieval, reading progress and backup behavior dependable in the live workflow.':'live workflow-এ search, retrieval, reading progress ও backup behavior dependable রাখা।','Next milestone · continue improving retrieval clarity from real use.':'পরবর্তী milestone · real use থেকে retrieval clarity উন্নত করা।','Next milestone · publish verified notes and outcomes over time.':'পরবর্তী milestone · সময়ের সঙ্গে verified note ও outcome publish করা।','interactive portfolio shell':'interactive portfolio shell','Live bot + public source':'Live bot + public source','LLM-powered feature':'LLM-powered feature','focused build · $300–$750':'focused build · $300–$750','growth build · $750+':'growth build · $750+','flexible · quality first':'flexible · quality first','web / responsive browser':'web / responsive browser','Termux / self-hosted':'Termux / self-hosted','file / search / storage':'file / search / storage','automation / notification':'automation / notification','interactive project brief':'interactive project brief','clear starting brief':'clear starting brief','progressive loading':'progressive loading','“I only publish feedback from people who have actually used the work.”':'“যারা সত্যিই কাজটি ব্যবহার করেছেন, শুধু তাদের feedback প্রকাশ করি।”','availability calendar':'availability calendar','client portal preview':'client portal preview','Rifat client workspace':'Rifat client workspace','Telegram document workflow':'Telegram document workflow','strong working practice':'strong working practice','stack constellation':'stack constellation','useful engineering note,':'useful engineering note,','A direct provider endpoint can send the brief to email or a Telegram notification. Until configured, this opens a prepared email draft.':'direct provider endpoint brief email বা Telegram notification-এ পাঠাতে পারে। configure না করা পর্যন্ত prepared email draft খুলবে।','I build with curiosity, automate with purpose, and shape every interface to make complex work feel simple.':'আমি curiosity নিয়ে build করি, purpose নিয়ে automate করি এবং complex কাজকে simple মনে হয় এমন interface তৈরি করি।','Make a growing document library easier to search and retrieve.':'বড় document library-কে সহজে search ও retrieve করা।','Telegram bot, SQLite structure and practical retrieval workflows.':'Telegram bot, SQLite structure ও practical retrieval workflow।','A focused document workflow that can be used directly inside Telegram.':'Telegram-এর ভেতরেই ব্যবহার করা যায় এমন focused document workflow।','Live bot and public source code.':'Live bot ও public source code।'
  });
  Object.assign(bnPhraseMap, {
    'I’m MD Rashidul Islam (Rifat), a self-taught Full-Stack AI Engineer from Narsingdi, Bangladesh. I build Telegram bots, LLM workflows, automation tools, and responsive interfaces that make complex technology feel practical.':'আমি MD Rashidul Islam (Rifat), নরসিংদী, বাংলাদেশের self-taught Full-Stack AI Engineer। Telegram bot, LLM workflow, automation tool ও responsive interface তৈরি করে complex technology-কে practical করে তুলি।','conversational AI interface':'conversational AI interface','single-page web experience':'single-page web experience','trade-off / failure handling':'trade-off / failure handling','Trade-offs / failure handling':'trade-off / failure handling','interactive portfolio shell':'interactive portfolio shell','focused build · $300–$750':'focused build · $300–$৭৫০','automation / notification':'automation / notification','Example: help our team find PDF documents faster':'উদাহরণ: team-কে PDF document দ্রুত খুঁজতে সাহায্য করা','Example: a small research team':'উদাহরণ: একটি ছোট research team','Example: searchable results inside Telegram':'উদাহরণ: Telegram-এর মধ্যে searchable result','Deadline, platform, existing API, data or deployment constraints':'deadline, platform, existing API, data বা deployment constraint','try: projects':'try: projects লিখুন','Static mode shows only this browser’s locally stored events. Add a protected JSON endpoint for real site-wide analytics; never place admin credentials in client-side code.':'static mode শুধু এই browser-এ locally stored event দেখায়। real site-wide analytics-এর জন্য protected JSON endpoint যুক্ত করুন; client-side code-এ admin credential রাখবেন না।','“I build with curiosity, automate with purpose, and shape every interface to make complex work feel simple.”':'“আমি curiosity নিয়ে build করি, purpose নিয়ে automate করি এবং complex কাজকে simple মনে হয় এমন interface তৈরি করি।”','— MD Rashidul Islam (Rifat)':'— MD Rashidul Islam (Rifat)'
  });
  const normalizeText = value => String(value || '').replace(/\s+/g, ' ').trim();
  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  const preserveWhitespace = (source, replacement) => { const lead = source.match(/^\s*/)?.[0] || ''; const trail = source.match(/\s*$/)?.[0] || ''; return `${lead}${replacement}${trail}`; };
  const localizeDocument = toBn => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) { const node = walker.currentNode; const parent = node.parentElement; if (parent && !['SCRIPT','STYLE'].includes(parent.tagName)) nodes.push(node); }
    nodes.forEach(node => { if (!originalText.has(node)) originalText.set(node, node.nodeValue); const english = originalText.get(node); const translation = bnPhraseMap[normalizeText(english)]; node.nodeValue = toBn && translation ? preserveWhitespace(english, translation) : english; });
    $$('[placeholder],[title],[aria-label],[alt]').forEach(element => { let attrs = originalAttrs.get(element); if (!attrs) { attrs = {}; ['placeholder','title','aria-label','alt'].forEach(name => { if (element.hasAttribute(name)) attrs[name] = element.getAttribute(name); }); originalAttrs.set(element, attrs); } Object.entries(attrs).forEach(([name, english]) => { const translation = bnPhraseMap[normalizeText(english)]; if (toBn && translation) element.setAttribute(name, translation); else element.setAttribute(name, english); }); });
  };
  const refreshNewContentLanguage = () => { localizeDocument(false); if (isBn()) localizeDocument(true); };
  const translations = { bn: { nav: ['সম্পর্কে','সেবাসমূহ','কাজ','কেস স্টাডি','নোট','বিল্ড নোটস','প্রক্রিয়া','যোগাযোগ'], hero: 'উপযোগী Telegram AI ও web system তৈরি করি', services: 'বাস্তব কাজের জন্য গড়া practical system.', caseStudies: 'সমস্যা থেকে proof পর্যন্ত', activity: 'আমার workbench-এর live window.', notes: 'build করার পথে ছোট কিছু নোট.', feedback: 'বিশ্বাস অর্জন করতে হয়.', contact: 'চলুন অসাধারণ কিছু তৈরি করি.' } };
  const applyLanguage = language => {
    document.documentElement.dataset.language = language;
    document.documentElement.lang = language === 'bn' ? 'bn' : 'en';
    if (languageToggle) { languageToggle.setAttribute('aria-pressed', String(language === 'bn')); languageToggle.setAttribute('aria-label', language === 'bn' ? 'Switch to English' : 'Switch to Bengali'); languageToggle.textContent = language === 'bn' ? 'EN' : 'বাংলা'; }
    const bn = language === 'bn';
    localizeDocument(false);
    $$('[data-en][data-bn]').forEach(node => { node.innerHTML = bn ? node.dataset.bn : node.dataset.en; });
    $$('.section-toc__links a').forEach(link => { link.textContent = bn ? link.dataset.tocBn : link.dataset.tocLabel; });
    const optionTranslations = { '#fit-goal': { bot: 'Telegram workflow', llm: 'LLM-powered feature', automation: 'Repetitive process', web: 'Web interface' }, '#fit-stage': { idea: 'Just an idea', prototype: 'Prototype exists', live: 'Already live' }, '#fit-budget': { lean: 'Lean first version · under $300', focused: 'Focused build · $300–$750', growth: 'Growth build · $750+', unsure: 'Not sure yet' }, '#fit-deadline': { flexible: 'Flexible · quality first', month: 'Within 1 month', urgent: 'Within 2 weeks', unsure: 'Not sure yet' }, '#fit-platform': { telegram: 'Telegram', web: 'Web / responsive browser', hybrid: 'Telegram + web', termux: 'Termux / self-hosted' }, '#fit-integration': { llm: 'LLM / AI API', files: 'Files / search / storage', automation: 'Automation / notifications', none: 'No integration yet' }, '#fit-complexity': { focused: 'One focused workflow', multi: 'Several connected workflows', platform: 'A product foundation' } };
    const optionTranslationsBn = { '#fit-goal': { bot: 'Telegram-ভিত্তিক workflow', llm: 'LLM-চালিত feature', automation: 'repetitive process', web: 'web interface' }, '#fit-stage': { idea: 'শুধু idea', prototype: 'Prototype আছে', live: 'ইতিমধ্যে live' }, '#fit-budget': { lean: 'প্রথম version · $৩০০-এর কম', focused: 'focused build · $৩০০–$৭৫০', growth: 'growth build · $৭৫০+', unsure: 'এখনও নিশ্চিত নয়' }, '#fit-deadline': { flexible: 'flexible · quality first', month: '১ মাসের মধ্যে', urgent: '২ সপ্তাহের মধ্যে', unsure: 'এখনও নিশ্চিত নয়' }, '#fit-platform': { telegram: 'Telegram', web: 'Web / responsive browser', hybrid: 'Telegram + web', termux: 'Termux / self-hosted' }, '#fit-integration': { llm: 'LLM / AI API', files: 'file / search / storage', automation: 'automation / notification', none: 'এখনও integration নেই' }, '#fit-complexity': { focused: 'একটি focused workflow', multi: 'কয়েকটি connected workflow', platform: 'একটি product foundation' } };
    Object.entries(optionTranslations).forEach(([selector, englishMap]) => { const select = $(selector); if (!select) return; [...select.options].forEach(option => { if (!option.dataset.en) option.dataset.en = option.textContent; option.textContent = bn ? (optionTranslationsBn[selector]?.[option.value] || option.dataset.en) : (englishMap[option.value] || option.dataset.en); }); });
    const navLabels = bn ? translations.bn.nav : ['About','Services','Work','Case studies','Notes','Build Notes','Process','Contact'];
    $$('.site-nav__links > a:not(.nav-cta)').forEach((link, index) => { if (navLabels[index]) link.textContent = navLabels[index]; });
    const setText = (selector, english, bengali) => { const node = $(selector); if (node) node.textContent = bn ? bengali : english; };
    const setHTML = (selector, english, bengali) => { const node = $(selector); if (node) node.innerHTML = bn ? bengali : english; };
    setHTML('#hero-title','Building <i>useful</i><br><span id="hero-rotating">Telegram AI Bots</span>','উপযোগী <i>Telegram AI</i> ও web system তৈরি করি');
    typeLoop($('#hero-rotating'), bn ? ['Telegram AI Bot', 'LLM System', 'Web Interface', 'Agentic Workflow'] : heroRotationPhrases, 62, 1750);
    setHTML('#services-title','Practical systems, shaped for <i>real work.</i>','বাস্তব কাজের জন্য গড়া <i>practical system</i>');
    setHTML('#case-studies-title','From problem to <i>proof.</i>','সমস্যা থেকে <i>প্রমাণ</i> পর্যন্ত');
    setHTML('#activity-title','A live window into the <i>workbench.</i>','আমার <i>workbench</i>-এর live window');
    setHTML('#notes-title','Small observations from <i>the build.</i>','build করার পথে ছোট কিছু <i>নোট</i>');
    setHTML('#feedback-title','Trust should be <i>earned.</i>','বিশ্বাস <i>অর্জন</i> করতে হয়');
    setHTML('#contact-title','Let’s build something <i>exceptional.</i>','চলুন <i>অসাধারণ</i> কিছু তৈরি করি');
    document.title = bn ? 'MD Rashidul Islam (Rifat) | Full-Stack AI Engineer' : 'MD Rashidul Islam (Rifat) | AI Systems & Full-Stack Engineer';
    if (typeof setPortalTab === 'function') setPortalTab($('.portal-tab.is-active')?.dataset.portalTab || 'overview');
    if (typeof setPortalOpen === 'function' && portalPanel && portalToggle) setPortalToggleLanguageLabel();
    localizeDocument(bn);
  };
  languageToggle?.addEventListener('click', () => applyLanguage(document.documentElement.dataset.language === 'bn' ? 'en' : 'bn'));
  applyLanguage(localStorage.getItem('rifat-language') === 'bn' ? 'bn' : 'en');
  languageToggle?.addEventListener('click', () => localStorage.setItem('rifat-language', document.documentElement.dataset.language));

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();