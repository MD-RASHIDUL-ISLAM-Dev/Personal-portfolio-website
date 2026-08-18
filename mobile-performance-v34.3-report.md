# v34.3 Mobile Animation and Performance Report

## Executive summary

The v34.3 blank-content repair makes essential mobile cards visible immediately instead of waiting for an IntersectionObserver reveal state. This changes the mobile experience in an intentional way: project, service, process and Client-Ready cards no longer begin at `opacity: 0`, while the lightweight hero entrance, section watermark drift and other non-essential motion remain available. The repair therefore prioritizes reliable content visibility over delayed card choreography on small touch devices.

The latest successful mobile traversal baseline for this portfolio measured a complete scripted scroll across the feature-rich page at approximately **1.128 seconds on a 360px viewport** and **1.135 seconds on a 390px viewport**. Those values represent the scroll traversal and reveal-settle loop, not a synthetic animation score. The v34.3 change removes the expensive failure mode—cards remaining hidden—and does not add a continuous animation loop for mobile cards.

## Mobile behavior after v34.3

| Area | 360px / 390px behavior | Interpretation |
|---|---|---|
| Essential cards | Visible immediately | No blank project or Client-Ready blocks while an observer waits |
| Hero entrance | Preserved | Short entrance motion remains part of the first impression |
| Section watermark drift | Preserved where supported | Decorative, non-blocking visual layer |
| Desktop Proof-to-Flow canvas | Disabled on touch/coarse pointers | Prevents unnecessary canvas work on mobile |
| Custom cursor and cursor trail | Disabled on touch/coarse pointers | No hover-only interaction burden |
| Reduced-motion / Simplified View | Immediate content, decorative motion removed | Accessibility-safe fallback |
| Horizontal overflow | 0px in the successful mobile audits | Content stays within the viewport |

## Runtime measurements

The table below records the latest successful mobile traversal metrics collected from the portfolio’s mobile performance audit. Browser performance counters are cumulative deltas for the scripted page traversal and should not be read as isolated animation costs.

| Metric | 360px | 390px |
|---|---:|---:|
| Scripted scroll traversal | 1.128s | 1.135s |
| End cumulative task duration | 2.016s | 1.979s |
| End cumulative script duration | 158ms | 162ms |
| End cumulative layout duration | 457ms | 328ms |
| End cumulative style recalculation | 198ms | 199ms |
| Horizontal overflow | 0px | 0px |

The v34.3 safety rule applies `opacity: 1`, `visibility: visible`, `transform: none` and `clip-path: none` to essential motion targets below 760px. Therefore, the card-reveal speed on mobile is effectively **immediate after layout**, rather than a delayed fade/clip sequence. This is a deliberate trade-off: the page feels faster and, more importantly, never shows a large empty section because an observer or cached navigation missed a target.

## What the user should feel

On a normal touch device, the page should load with the hero entrance, then present project and service content without waiting for a cursor or hover state. Scrolling should feel direct: cards are already readable when they enter the viewport, while the remaining decorative motion stays subtle. On devices or settings that request reduced motion, the same content remains available without decorative transitions.

A fresh v34.3 preview is available at [the corrected mobile preview](https://4183-ih3eq9kgv77c3syrirv4m-dcd118f9.sg1.manus.computer/?v=34.3&motion=2&mobile-perf=1&fresh=perf-audit#top).

## Measurement note

A second automated harness attempt against the temporary preview target timed out because the sandbox browser target became `about:blank` between navigation and the remote performance session. It did not produce a valid new metric sample, so no fabricated v34.3 numeric values are reported here. The v34.3 code-level checks, static validation, cache-bust verification and the successful mobile traversal metrics above are the evidence used for this report.

## Validation evidence

The corrected build passed JavaScript and service-worker syntax checks, retained the static validator result of 714 IDs, 7 images, 28 forms and 359 required features, and preserved the 0px mobile-overflow guard. The `motion-failsafe.js` and mobile CSS fallback are included in the updated package.
