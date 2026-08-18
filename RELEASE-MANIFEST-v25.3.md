# Rifat portfolio v25.3 overflow repair manifest

Preview: https://4183-ih3eq9kgv77c3syrirv4m-dcd118f9.sg1.manus.computer/?v=25.3#contact

Archive: `/home/ubuntu/Rifat-portfolio-v25.3.zip`

Archive entries: 32

Archive bytes: 14,649,598

Archive SHA-256: `384d1aae44b8f8c5bd07f2f14306ccb482343813277c48ebaf65a2547d34b8a2`

Integrity: `unzip -tq` passed.

Static validation: `ids=502`, `images=7`, `forms=19`, `required_features=163`; HTML structure, local images, alt text, required features, hooks and service-worker checks passed.

Desktop overflow QA: fresh 1279px client reported `document.scrollWidth=1264`, header bounds left 42/right 1222, no visible header child outside the viewport and no contact descendant outside the viewport.

Mobile overflow QA: fresh 390px client reported `scrollWidth=390`, no header or contact descendants outside the viewport, contact wrap width 358px, menu open/body lock/ARIA state pass, five mobile utility controls present, and clean close/reset.

Theme/language QA: light, dark, Bengali and restored English states retained empty header/contact overflow lists and `scrollWidth=1264` at desktop.

Repair scope: shrinkable header children, controlled desktop/tablet gaps, mobile navigation containment, `min-width:0` across layout/form surfaces, safe wrapping for long contact/consent copy and `overflow-x:clip`.

Cache-busting: `style.css?v=25.3`, `script.js?v=25.3`

Service-worker cache: `rifat-portfolio-v25.2`
