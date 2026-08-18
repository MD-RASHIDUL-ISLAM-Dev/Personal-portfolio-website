# Rifat Portfolio v34.9 — Functional Recovery Release

## Release purpose

This release is a functionality recovery, not a visual redesign. It removes the proven mobile interaction blocker and makes the essential portfolio content safe by default.

## Root cause confirmed

The previous build loaded `motion-failsafe.js`. In a fresh 390px browser test, the page rendered initially, but the first mobile menu click caused the browser runtime to stop responding. The same test passed when only the main script was loaded and also passed when `startup-recovery.js` was loaded without `motion-failsafe.js`.

The earlier CSS architecture also hid content before JavaScript initialization. This made a script or observer failure appear as a blank page below the hero.

## Repair changes

| Area | v34.9 change |
| --- | --- |
| Essential content | `.reveal-item` is visible by default. The hidden reveal state is now gated behind `.js-motion-init`. |
| Motion initialization | `script.js` adds `.js-motion-init` immediately before enabling `.motion-ready`. |
| Mobile scroll | `body.menu-open` no longer applies `overflow:hidden`; document scrolling remains available. |
| Blocking fallback | `motion-failsafe.js` is no longer loaded or pre-cached. It remains only in the historical backup, not in the deploy package. |
| Safe recovery | `startup-recovery.js` remains as the lightweight emergency recovery path. |
| Cache safety | HTML assets and the service worker use `v34.9`; the cache name is `rifat-portfolio-v34.9`. |

## Verification results

Fresh isolated Chromium checks passed at 360px, 390px, and 1280px. At 360px and 390px, the document had a full page height, zero hidden motion targets, `overflowY: auto`, successful menu open/close with correct ARIA state, successful scroll to `1200px`, and successful AI launcher and Contact QR transitions. At 1280px, the page had `overflowY: auto`, successful menu state transitions, successful scrolling, and successful AI/QR transitions; three desktop motion cards remained unrevealed outside the initial viewport as expected from the optional desktop reveal layer.

Static validation also passed: 714 IDs, 7 images, 28 forms, 359 required feature checks, HTML structure, local image references, image alt text, hooks, JavaScript syntax and service-worker cache contract.

## Deployment note

The live domain previously returned `style.css?v=25.2` and `script.js?v=25.2`, while this repaired release uses v34.9. The live domain will not change until the files in the deploy package are uploaded to the hosting provider. After deployment, clear the site data or service-worker cache once on the test phone, then open the new URL in a private tab for the first verification.
