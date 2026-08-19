# AI Panel Repair v37.1

## Problem corrected

On narrow mobile screens, the AI panel could sit beneath the header or section layers, the suggestion buttons could keep a two-column width that pushed Bengali/English text outside the button box, and the suggestion area could overlap the input row or the mobile sticky CTA.

## Repair

The mobile AI assistant is now a fixed, high-priority interaction layer with a bounded viewport-safe panel. The panel uses an internal message scroll area, a single-column suggestion list, explicit `min-width: 0`, `overflow-wrap: anywhere`, `word-break: break-word`, and a contained input/note region. The sticky CTA remains below the panel and the document remains scrollable.

## Verification

Fresh 360px and 390px probes confirmed that the panel stays entirely inside the viewport, does not overlap the header or sticky CTA, has no suggestion text overflow, and keeps `overflowY: auto`. Menu open/close, page scrolling, AI launcher, Contact QR and desktop 1280px interactions also passed.
