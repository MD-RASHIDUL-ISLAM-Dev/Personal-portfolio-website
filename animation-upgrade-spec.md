# Original animation upgrade specification

## Direction

The updated site will keep Rifat's existing dark navy/gold editorial identity while borrowing only high-level cues from the two references: oversized typography, generous visual breathing room, quiet confidence, monochrome/editorial layering and a device/portrait focal point. No reference artwork, code, brand name or exact layout will be copied.

## Motion system

1. **Opening reveal:** add a short, non-blocking editorial intro state. The hero eyebrow, title lines, supporting copy, status card, CTA rail and portrait plate enter in a staggered 60–100ms sequence. The page must remain usable if JavaScript is disabled or if the user prefers reduced motion.
2. **Hero depth:** use a pointer-safe CSS variable for very small portrait/hero-aura parallax on fine pointers only. Mobile and coarse pointers keep the hero stable.
3. **Section-word drift:** add a faint oversized word watermark to major editorial sections, moving only through a CSS transform variable updated by a throttled scroll requestAnimationFrame. It must remain behind content, not affect layout and be hidden in simplified/reduced-motion modes.
4. **Scroll choreography:** extend the existing `.reveal-item` behavior with a subtle clip-path/translate progression for marked headings and project rails, without changing content visibility or causing cumulative layout shift.
5. **Project interaction:** enhance existing cards with editorial media zoom, caption lift, border light sweep and restrained tilt. Existing pointer/coarse safeguards remain the source of truth.
6. **CTA micro-interactions:** retain existing magnetic buttons but add a small underline/shine sweep for keyboard and pointer focus. No transform should be applied to focused text containers.
7. **Theme continuity:** animation colors must inherit the current theme and preserve the v33.5 dark-mode contrast guard. Light mode must continue using existing high-contrast overrides.

## Accessibility and performance

The implementation will honor `prefers-reduced-motion`, the existing Simplified View toggle, `saveData`, coarse pointers and mobile breakpoints. All motion is limited to opacity, transform, clip-path or CSS custom properties. No new dependency will be added. Scroll listeners remain passive and rAF-throttled. All controls keep visible focus rings and touch-safe dimensions. Existing client-ready, AI, modal, language, theme, preview and keyboard interactions must remain unchanged.

## Acceptance criteria

The updated build must remain framework-free and deployable as a static folder. At 360px, 390px and desktop widths it must have no horizontal overflow. Hero and project interactions must remain readable in both themes and Bengali/English. Visual case-study previews must still load, and reduced-motion mode must disable non-essential animation while leaving content visible.
