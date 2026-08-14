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
    appendTerminalLine('terminal-response', terminalCommands[command] || `Command “${command}” not found. Type “help” to explore the portfolio.`);
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
      if (formStatus) formStatus.textContent = 'Sending your message securely…';
      try {
        const response = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, subject, projectType, budget, message }) });
        if (!response.ok) throw new Error(`Submission failed: ${response.status}`);
        contactForm.reset();
        if (formStatus) formStatus.textContent = 'Message sent. Thank you — I will reply within 24–48 hours.';
      } catch (error) {
        if (formStatus) formStatus.textContent = 'Direct submission failed, so an email draft will open instead.';
        window.location.href = `mailto:rashidulislamrifat14708@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
      return;
    }
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

  /* Bot walkthrough: deterministic, clearly labelled simulation */
  const botMessages = $('#bot-messages');
  const botFlows = {
    search: [['user', 'Search for “MRI workflow”'], ['bot', '<strong>12 results found.</strong><br>Closest matches ranked with title, category and reading progress.']],
    retrieve: [['user', 'Open result #03'], ['bot', '<strong>MRI_workflow.pdf</strong><br>Ready to retrieve · 68% reading progress · 2.4 MB']],
    backup: [['user', 'Show backup status'], ['bot', '<strong>Backup healthy.</strong><br>Last snapshot: today · 03:20 UTC · 3 restore points available.']]
  };
  $$('[data-bot-action]').forEach(button => button.addEventListener('click', () => {
    const flow = botFlows[button.dataset.botAction];
    if (!flow || !botMessages) return;
    flow.forEach(([role, text]) => {
      const message = document.createElement('div');
      message.className = `bot-message bot-message--${role}`;
      message.innerHTML = `<small>now</small><p>${text}</p>`;
      botMessages.appendChild(message);
    });
    botMessages.scrollTop = botMessages.scrollHeight;
  }));

  /* Case-study deep dive tabs */
  const deepDiveData = {
    archive: { kicker: 'Telegram · Python · SQLite', title: 'MRI PDF Archive Vault', summary: 'A document workflow designed around the moment a file needs to be found, not merely stored.', problem: 'A growing PDF library was becoming harder to search, organise and revisit.', thinking: 'Start where the user already works, then remove the repeated steps that slow retrieval down.', decision: 'Use Telegram as the interface, SQLite for durable state, and fuzzy matching for forgiving search.', challenge: 'Keep metadata, file storage, progress and backup behaviour coherent inside a small self-hosted system.', solution: 'A focused bot workflow with categorisation, fuzzy search, reading progress and automated backups.', outcome: 'A live, usable document vault that turns Telegram into a practical retrieval interface.', href: 'https://t.me/MRI_PDF_ARCHIVE_Bot', preview: 'archive' },
    deepseek: { kicker: 'DeepSeek · OpenRouter · Telegram', title: 'DeepSeek Telegram AI Bot', summary: 'A conversational AI direction that places model access inside a familiar, low-friction interface.', problem: 'Users should be able to ask questions without leaving the conversation surface they already understand.', thinking: 'Keep the first version focused: one clear conversational loop before adding a crowded command system.', decision: 'Route model requests through OpenRouter so the model layer can evolve without rewriting the Telegram experience.', challenge: 'Balance response quality, latency, API fallbacks and readable output inside a chat-first flow.', solution: 'A Telegram conversation layer connected to DeepSeek R1 through OpenRouter with a clear path for future expansion.', outcome: 'An active build direction with a practical foundation for real-time conversational AI.', href: '#contact', preview: 'deepseek' },
    portfolio: { kicker: 'HTML5 · CSS3 · Vanilla JavaScript', title: 'Personal Portfolio Website', summary: 'An interface designed to make technical work feel clear, calm and memorable.', problem: 'A portfolio needs to prove engineering ability without becoming a catalogue of disconnected effects.', thinking: 'Lead with positioning, then move through proof, process and a low-friction contact path.', decision: 'Use semantic HTML, custom CSS and vanilla JavaScript to keep the site fast, portable and understandable.', challenge: 'Balance editorial art direction with responsive behavior, keyboard access and honest proof signals.', solution: 'A single-page system with project rails, filters, case studies, responsive motion, SEO and share-ready metadata.', outcome: 'A live personal brand interface that explains the work and makes the next conversation obvious.', href: 'https://www.mdrashidulislam.kdns.fr/', preview: 'portfolio' }
  };
  const setDeepDive = key => {
    const data = deepDiveData[key];
    if (!data) return;
    ['kicker','title','summary','problem','thinking','decision','challenge','solution','outcome'].forEach(field => { const node = $(`#deep-${field}`); if (node) node.textContent = data[field]; });
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
    if (githubState) githubState.textContent = 'Unavailable right now';
    const list = $('#github-repos');
    if (list) list.innerHTML = `<p class="small-note">${message} <a href="https://github.com/${githubUser}" target="_blank" rel="noopener">Open the profile directly →</a></p>`;
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
      if (githubState) githubState.textContent = 'Updated just now';
      if (heatmap) { heatmap.innerHTML = ''; const publicActivity = events.filter(event => ['PushEvent','CreateEvent','PullRequestEvent','IssuesEvent'].includes(event.type)); for (let index = 0; index < 64; index += 1) { const cell = document.createElement('i'); const event = publicActivity[index]; cell.dataset.level = event ? (event.type === 'PushEvent' ? 4 : event.type === 'PullRequestEvent' ? 3 : 2) : (index % 9 === 0 ? 1 : 0); if (event) cell.title = `${event.type.replace('Event','')} · ${new Date(event.created_at).toLocaleDateString()}`; heatmap.appendChild(cell); } }
      const list = $('#github-repos');
      if (list) list.innerHTML = repos.slice(0, 4).map(repo => `<div class="github-repo"><span><strong>${repo.name}</strong><small>${repo.language || 'Public repository'} · ★ ${repo.stargazers_count || 0}</small></span><a href="${repo.html_url}" target="_blank" rel="noopener">View ↗</a></div>`).join('') || '<p class="small-note">No public repositories returned.</p>';
    } catch (error) { renderGithubFallback('The public snapshot could not load.'); }
  };
  renderGithub();

  /* Optional uptime endpoint: expected JSON {status: "up", uptime: "99.9%"} */
  const uptimeNode = $('#bot-uptime');
  const uptimeEndpoint = uptimeNode?.dataset.uptimeEndpoint?.trim();
  if (uptimeEndpoint) {
    fetch(uptimeEndpoint).then(response => { if (!response.ok) throw new Error('Uptime endpoint unavailable'); return response.json(); }).then(status => { uptimeNode.textContent = `${status.uptime || status.status || 'Status available'}`; }).catch(() => { uptimeNode.textContent = 'Status unavailable'; });
  }

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
    { topic: 'services', text: 'Rifat builds Telegram AI bots, LLM integrations, Python automation utilities, and responsive web interfaces. The work starts from a practical user problem and a focused first version.' },
    { topic: 'mri vault', text: 'MRI PDF Archive Vault is a Telegram-based PDF storage and retrieval workflow. It combines smart categorisation, fuzzy search, reading progress, SQLite-backed state, and automated backups on Termux.' },
    { topic: 'deepseek bot', text: 'DeepSeek Telegram AI Bot is an active conversational AI build that connects DeepSeek R1 through OpenRouter to a focused Telegram conversation flow. The design considers model routing, readable output, latency, and fallback options.' },
    { topic: 'portfolio', text: 'This portfolio uses semantic HTML, modern CSS and vanilla JavaScript. It includes project filtering, case studies, Canvas effects, accessible dialogs, GitHub public activity, and theme and language controls.' },
    { topic: 'skills', text: 'Core working skills include Python, SQLite, Telegram Bot API, AsyncIO, OpenRouter API, DeepSeek R1, prompt engineering, HTML, CSS, JavaScript, Canvas API, GitHub and Termux.' },
    { topic: 'contact', text: 'For a project discussion, use the contact form, email rashidulislamrifat14708@gmail.com, or WhatsApp +880 1737-608355. The stated reply target is 24–48 hours.' }
  ];
  const assistantTokens = value => String(value || '').toLowerCase().match(/[a-z0-9]+/g) || [];
  const retrieveLocalAnswer = question => {
    const tokens = assistantTokens(question);
    const ranked = knowledgeBase.map(item => ({ item, score: tokens.reduce((total, token) => total + (item.topic.includes(token) || item.text.toLowerCase().includes(token) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score);
    if (!ranked[0] || ranked[0].score === 0) return 'I can answer questions about Rifat’s services, MRI PDF Archive Vault, DeepSeek Telegram AI Bot, technical skills, this portfolio, or the contact path. Try one of those topics.';
    return ranked[0].item.text;
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
      if (aiNote) aiNote.textContent = 'Contacting the configured secure assistant endpoint…';
      try {
        const response = await fetch(assistantEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ message: cleanQuestion, context: knowledgeBase }) });
        if (!response.ok) throw new Error('Assistant endpoint unavailable');
        const data = await response.json();
        addAssistantMessage('bot', String(data.answer || data.message || retrieveLocalAnswer(cleanQuestion)));
        if (aiNote) aiNote.textContent = 'Secure assistant endpoint response.';
        return;
      } catch (error) { if (aiNote) aiNote.textContent = 'Secure endpoint unavailable; local project retrieval is answering instead.'; }
    }
    addAssistantMessage('bot', retrieveLocalAnswer(cleanQuestion));
    if (aiNote) aiNote.textContent = 'Local retrieval mode is active. No question is sent to an external AI service.';
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
    if (!email || !email.includes('@')) { if (newsletterStatus) newsletterStatus.textContent = 'Please enter a valid email address.'; return; }
    const endpoint = (newsletterForm.dataset.newsletterEndpoint || '').trim();
    if (endpoint) { if (newsletterStatus) newsletterStatus.textContent = 'Saving your subscription…'; try { const response = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'Build Notes' }) }); if (!response.ok) throw new Error('Subscription failed'); newsletterForm.reset(); if (newsletterStatus) newsletterStatus.textContent = 'You are on the Build Notes list.'; trackEvent({ name: 'newsletter_subscribe' }); return; } catch (error) { if (newsletterStatus) newsletterStatus.textContent = 'Provider unavailable; opening an email request instead.'; } }
    window.location.href = `mailto:rashidulislamrifat14708@gmail.com?subject=${encodeURIComponent('Build Notes subscription')}&body=${encodeURIComponent(`Please add ${email} to the Build Notes list.`)}`;
  });

  /* Theme and language preferences */
  const themeToggle = $('#theme-toggle');
  const languageToggle = $('#language-toggle');
  const savedTheme = localStorage.getItem('rifat-theme');
  const applyTheme = theme => { document.documentElement.dataset.theme = theme; localStorage.setItem('rifat-theme', theme); if (themeToggle) { themeToggle.setAttribute('aria-pressed', String(theme === 'light')); themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'); themeToggle.textContent = theme === 'light' ? '☾' : '☼'; } };
  applyTheme(savedTheme === 'light' ? 'light' : 'dark');
  themeToggle?.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));
  const translations = { bn: { nav: ['সম্পর্কে','সেবাসমূহ','কাজ','কেস স্টাডি','নোট','Build Notes','প্রক্রিয়া','যোগাযোগ'], hero: 'Building useful Telegram AI & web systems', services: 'Practical systems, shaped for real work.', caseStudies: 'From problem to proof.', activity: 'A live window into the workbench.', notes: 'Small observations from the build.', feedback: 'Trust should be earned.', contact: 'Let’s build something exceptional.' } };
  const applyLanguage = language => {
    document.documentElement.dataset.language = language;
    document.documentElement.lang = language === 'bn' ? 'bn' : 'en';
    if (languageToggle) { languageToggle.setAttribute('aria-pressed', String(language === 'bn')); languageToggle.setAttribute('aria-label', language === 'bn' ? 'Switch to English' : 'Switch to Bengali'); languageToggle.textContent = language === 'bn' ? 'EN' : 'বাংলা'; }
    const bn = language === 'bn';
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
  };
  languageToggle?.addEventListener('click', () => applyLanguage(document.documentElement.dataset.language === 'bn' ? 'en' : 'bn'));
  applyLanguage(localStorage.getItem('rifat-language') === 'bn' ? 'bn' : 'en');
  languageToggle?.addEventListener('click', () => localStorage.setItem('rifat-language', document.documentElement.dataset.language));

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();