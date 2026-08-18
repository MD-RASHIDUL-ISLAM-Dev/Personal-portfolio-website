# Cursor-driven interaction upgrade

## Visual direction

Create an original premium cursor system for desktop/fine pointers: a small cyan/gold dot, a soft trailing orbit, a contextual label near interactive surfaces, magnetic proximity response, and a cursor-following media light on project cards. The treatment should feel cinematic and editorial rather than noisy or game-like.

## Interaction rules

- Fine pointer + hover-capable devices only. Hide the custom layer on touch/coarse pointers.
- Gate all non-essential cursor motion behind `prefers-reduced-motion`, Save-Data and Simplified View.
- Keep the existing cursor ring and ripple behavior; extend it rather than replacing it.
- Use a single rAF loop for the new trail/label position. Use CSS transforms and opacity only.
- Interactive labels should be short and contextual: VIEW, OPEN, COPY, TALK or EXPLORE. Native button/link text remains unchanged for accessibility.
- Project cards receive a small media offset/light treatment on pointer movement, not a layout-changing transform.
- Existing magnetic buttons, card tilt, theme contrast guards, mobile CTA and keyboard focus rings must stay functional.

## Acceptance criteria

The new layer must render at desktop widths, remain absent on 360px/390px touch emulation, respect reduced-motion, avoid horizontal overflow, preserve all current feature hooks and pass static validation. The final package will include a short visual note and desktop/mobile QA evidence.

## v33.8 desktop runtime checkpoint

Fresh desktop preview confirms fine pointer and hover support are active. The new layer mounts with five trailing orbit nodes, a contextual `EXPLORE` label appears when a project card receives pointerover, the project card receives `cursor-enhanced-card` and `is-cursor-active`, and document width remains contained with no positive overflow.

## v35 acceptance QA

Desktop fine-pointer emulation: the layer is present, five trails mount, project cards receive the enhancement class, and scroll containment is clean. Mobile 390px touch emulation: pointer media resolves to coarse/no-hover, the layer is absent, no trails mount, cards are not cursor-enhanced, and overflow is zero. Reduced-motion desktop emulation: the layer is absent and overflow remains clean.
