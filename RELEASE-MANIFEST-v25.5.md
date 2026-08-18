# Rifat portfolio v25.5 mobile composition manifest

Preview: https://4183-ih3eq9kgv77c3syrirv4m-dcd118f9.sg1.manus.computer/?v=25.5#ai-studio

Archive: `/home/ubuntu/Rifat-portfolio-v25.5.zip`

Archive entries: 38

Archive bytes: 14,664,481

Archive SHA-256: `7e20c8ea7ad0f079cec536b40cdc5cd2c2f1834288f1dd81a27c565c3e5a48ac`

Integrity: `unzip -tq` passed.

Static validation: `ids=502`, `images=7`, `forms=19`, `required_features=163`; HTML structure, local images, alt text, required features, hooks and service-worker checks passed.

Mobile composition repair: AI Studio uses a single-column flow through 1100px, each card uses natural height and `align-self:start`, output blocks do not reserve unnecessary minimum height, and consent text stays horizontal beside a fixed-size checkbox. The fixed header uses the compact menu through the same 1100px breakpoint.

Fresh 390px audit: `scrollWidth=390`, header height 62px, zero header/card overflow children, grounded card height 544px, brief analyzer 549px, architecture explainer 338px, case-study Q&A 478px, code review 664px, accessibility rewriter 542px, natural navigator 459px. Consent rows are contained with grounded width 324px/height 70px and code-review width 324px/height 46px.

Fresh 360px audit: `scrollWidth=360`, zero header/card overflow children, grounded card height 563px, natural navigator 452px, and all controls remain inside 328px cards.

Interaction QA: compact menu open/body lock/ARIA state, five mobile utility controls, clean close/reset, QR toggle with contained panel, and AI Studio forms were verified.

Cache-busting: `style.css?v=25.5`, `script.js?v=25.5`

Service-worker cache: `rifat-portfolio-v25.4`
