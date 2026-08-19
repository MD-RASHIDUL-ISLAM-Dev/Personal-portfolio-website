# Rifat Portfolio v37.0 — Motion Graphics Release

## Scope

This release adds polished motion graphics to the verified clean static portfolio without introducing a new framework, build step, or runtime dependency.

## Motion layers

Desktop screens receive a low-density constellation canvas with subtle particles, restrained connections, pointer-aware signal lines, visibility pause, resize handling and a capped render cadence near 24fps. Project, service and proof cards receive a short hover lift and sheen on fine-pointer/hover devices.

Mobile screens receive only a CSS ambient gradient drift. The canvas is intentionally disabled below 900px. Reduced-motion preferences and data-saver mode disable decorative motion completely.

## Safety contract

The motion script is isolated from content visibility, menu state, page overflow and button bindings. It is wrapped in a failure-safe boundary, uses a pointer-transparent canvas, and does not add any MutationObserver or scroll-lock fallback. `startup-recovery.js` remains the emergency recovery path.

## Verification

Fresh 360px, 390px and 1280px probes passed with complete document rendering, `overflowY: auto`, successful menu open/close, scrolling to 1,200px, AI launcher open/close and Contact QR open/close. Mobile reported no canvas and zero hidden essential motion targets. Desktop reported an active canvas and a fully rendered page; three optional desktop reveal cards remained outside the initial viewport as expected.

The final visual QA confirmed that the fixed desktop navigation and mobile header remain correctly positioned above the ambient layer.
