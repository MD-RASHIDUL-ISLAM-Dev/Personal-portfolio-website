/* ═══════════════════════════════════════════════════════════
   RIFAT PORTFOLIO · script.js
   Features: Navbar scroll, Mobile menu, Reveal animations,
             FAQ accordion, Contact form, Dynamic year
═══════════════════════════════════════════════════════════ */

// ─── Wait for DOM to load ───
document.addEventListener('DOMContentLoaded', function () {

  // ═══ 1. DYNAMIC YEAR IN FOOTER ═══
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  // ═══ 2. NAVBAR — Scroll effect ═══
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // Run on load


  // ═══ 3. MOBILE HAMBURGER MENU ═══
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {

    hamburger.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }


  // ═══ 4. SCROLL REVEAL ANIMATION ═══
  const revealElements = document.querySelectorAll('.reveal');

  // Use IntersectionObserver for performance
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Stagger children in the same parent if multiple reveals
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // Animate once only
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  // Stagger sibling reveal elements
  const revealGroups = {};

  revealElements.forEach(function (el) {
    const parent = el.parentElement;
    const key = parent ? parent.className + (parent.id || '') : 'root';

    if (!revealGroups[key]) revealGroups[key] = [];
    revealGroups[key].push(el);

    revealObserver.observe(el);
  });

  // Apply stagger delays to siblings
  Object.values(revealGroups).forEach(function (group) {
    if (group.length > 1) {
      group.forEach(function (el, idx) {
        el.style.transitionDelay = (idx * 0.08) + 's';
      });
    }
  });


  // ═══ 5. FAQ ACCORDION ═══
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');

      // Close all other items
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          const otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.classList.remove('open');
        }
      });

      // Toggle current item
      item.classList.toggle('open', !isOpen);
      answer.classList.toggle('open', !isOpen);
    });
  });


  // ═══ 6. CONTACT FORM ═══
  const contactForm = document.getElementById('contactForm');
  const formNote    = document.getElementById('formNote');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name    = document.getElementById('name').value.trim();
      const email   = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();

      // Basic validation
      if (!name || !email || !subject || !message) {
        showFormNote('Please fill in all fields.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showFormNote('Please enter a valid email address.', 'error');
        return;
      }

      // Build mailto link and open it
      const mailtoLink =
        'mailto:rashidulislamrifat14708@gmail.com' +
        '?subject=' + encodeURIComponent('[Portfolio] ' + subject) +
        '&body=' + encodeURIComponent(
          'Name: ' + name + '\n' +
          'Email: ' + email + '\n\n' +
          'Message:\n' + message
        );

      window.location.href = mailtoLink;

      // Show success note
      showFormNote('✓ Your email client has been opened. Send the message from there!', 'success');

      // Reset form after short delay
      setTimeout(function () {
        contactForm.reset();
        formNote.textContent = '';
      }, 5000);
    });
  }

  function showFormNote(text, type) {
    if (!formNote) return;
    formNote.textContent = text;
    formNote.style.color = type === 'error' ? '#ff6b6b' : 'var(--code-green)';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


  // ═══ 7. ACTIVE NAV LINK ON SCROLL ═══
  const sections  = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveLink() {
    let currentId = '';
    const scrollPos = window.scrollY + 100;

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        currentId = section.getAttribute('id');
      }
    });

    navAnchors.forEach(function (link) {
      link.style.color = '';
      if (link.getAttribute('href') === '#' + currentId) {
        link.style.color = 'var(--text-1)';
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();


  // ═══ 8. SKILL PILLS — Hover ripple effect ═══
  const pills = document.querySelectorAll('.pill');

  pills.forEach(function (pill) {
    pill.addEventListener('mouseenter', function () {
      this.style.transition = 'all 0.2s ease';
    });
  });


  // ═══ 9. SMOOTH SCROLL for all anchor links ═══
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });


  // ═══ 10. HERO TEXT — Subtle typing cursor effect ═══
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    // Add subtle entrance for hero elements
    const heroElements = document.querySelectorAll('.hero-badge, .hero-label, .hero-title, .hero-desc, .hero-actions, .hero-stat-bar');
    heroElements.forEach(function (el, idx) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

      setTimeout(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 150 + idx * 100);
    });
  }

}); // End DOMContentLoaded
