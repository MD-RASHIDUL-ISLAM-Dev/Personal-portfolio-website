# Dribbble reference notes

## Reference 1 — Personal Portfolio Website — Animations
Source: https://dribbble.com/shots/26995447-Personal-Portfolio-Website-Animations

The accessible description emphasizes large typography, strong hierarchy, generous whitespace, selected-work focus, calm interfaces and recruiter/client-friendly structure. The visual frame uses a light editorial canvas, a compact pill-like navigation, an oversized outlined/filled personal name treatment, a centered portrait, restrained status indicator and short CTA. The composition is intentionally quiet rather than effects-heavy; motion should support hierarchy and reveal rather than compete with content.

Primary visual inspected: https://cdn.dribbble.com/userupload/46427695/file/cad10322ddc9e0573ed8e23c5ca1c14b.png?resize=752x&vertical=center

## Reference 2 — Personal Portfolio Website Design
Source: https://dribbble.com/shots/24978876-Personal-Portfolio-Website-Design

The primary frame uses a monochrome editorial direction: a clean white canvas, minimal top navigation, very large faint background typography, an oversized greeting, an angled laptop/device image as the visual anchor, compact metadata, and a simple scroll cue. The useful animation cues are subtle parallax/tilt, scale-in of the device hero, background type drift, and slow reveal timing—not dense perpetual motion.

Primary visual inspected: https://cdn.dribbble.com/userupload/16932196/file/original-0583fdb976026ff8b5ec8cf08369ff8d.jpg?resize=752x&vertical=center

## Original implementation direction

Do not copy the reference code, artwork, text, branding or exact layout. Adapt the shared visual language to Rifat's existing dark navy/gold editorial system: oversized hero type with staggered reveal, portrait float/parallax, faint oversized section-word watermark, project-card hover lift/tilt, scroll-linked progress and section reveals, cursor-safe magnetic CTAs, and page-level transitions. Keep all existing functionality, Bengali/English localization, dark/light theme controls, reduced-motion behavior and mobile no-overflow constraints. Use CSS transforms/opacity and IntersectionObserver or existing vanilla JS patterns rather than adding a framework or animation dependency.

## v33.6 implementation checkpoint

The fresh v33.6 preview loaded the new motion layer without a runtime error. The root has `motion-ready` and `motion-entered`; the hero title and portrait visual are fully visible after the entrance sequence, and the `#projects` section has `data-motion-word="SELECTED WORK"` with a computed drift value. The 34 motion cards are initially not marked visible while they remain below the viewport, which is expected for IntersectionObserver-driven reveal; the next QA step scrolls to verify cards become visible.

The first reveal probe showed a problem: after scrolling to `#projects`, its three motion cards remained opacity 0 and had no `.is-motion-visible` class. The section watermark still updates. This suggests the new observer is interacting poorly with the existing `content-visibility:auto`/nested scrolling state or the probe needs an explicit post-scroll settle; it is being diagnosed before delivery so cards cannot remain hidden.

## v33.7 reveal fallback checkpoint

The first IntersectionObserver probe found that `#projects` cards could remain at opacity 0 when long-section/content-visibility geometry reported them outside the viewport after anchor navigation. A viewport-based rAF-throttled fallback was added to reveal `.motion-rise` and `.motion-card` targets when their bounding boxes enter the viewport, while preserving reduced-motion and simplified-view behavior. v33.7 loaded the updated source and existing feature-rich shell remained intact.

The deterministic v33.7 reveal check succeeded: after setting smooth scrolling to auto and positioning `#projects` at the viewport top, the first two visible project cards received `.is-motion-visible` and computed opacity `1`; the third card remained below the viewport and opacity `0`, which is the intended lazy reveal behavior.

Visual QA at v33.7 shows the original dark navy/gold identity remains intact while the new faint oversized `SELECTED WORK` watermark sits behind the projects heading and the project imagery/card hierarchy remains readable. The page still exposes the existing Bengali navigation, AI assistant, filters and project actions.

## Final v33.7 motion QA checkpoint

The motion QA passed at 360px, 390px and 1280px. Standard motion revealed the two cards visible in the viewport and retained the third below the viewport; reduced-motion mode made all project cards visible immediately. Every run had zero motion-target overflow and the document scrollWidth matched the expected viewport/container. Existing client-ready QA remained clean at all three widths, preview QA loaded every tested case-study image, and AI mobile, surface interaction and keyboard-guide regressions passed. Static validation remained 714 IDs, 7 images, 28 forms and 359 required features.

## Mobile visual/performance checkpoint

Captured 360px screenshots show the new mobile hero at a stable readable state: the large Bengali/English editorial title fits the viewport, the portrait is not forced into an unsafe parallax transform, navigation remains compact, and the status rail stays within the screen. The scrolled screenshot shows revealed proof cards with visible borders and body copy, the background constellation remains subtle, and the existing bottom sticky contact CTA remains touch-safe. No horizontal clipping is visible.

The corrected mobile performance harness disabled smooth-scroll only during measurement so each target section could be reached deterministically. At 360px and 390px, document/body scrollWidth matched the viewport exactly. The harness reported low single-digit-second cumulative browser task time over the full scripted section traversal, with layout and style recalculation staying bounded; these are browser-session totals, not a claimed per-frame FPS benchmark.

Final capture correction: the earlier 390px hero image was taken while reload restored the previous deep scroll position, not because the hero was blank. The harness now sets `history.scrollRestoration='manual'`, waits for the entrance transition and resets to `scrollY=0` before capture. The corrected 390px hero screenshot shows the Bengali headline, status rail, compact header/menu, subtle constellation and AI launcher fitting cleanly within the viewport.
