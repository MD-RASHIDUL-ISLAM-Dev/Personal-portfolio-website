# Rifat portfolio v25.4 definitive repair manifest

Preview: https://4183-ih3eq9kgv77c3syrirv4m-dcd118f9.sg1.manus.computer/?v=25.4#contact

Archive: `/home/ubuntu/Rifat-portfolio-v25.4.zip`

Archive entries: 33

Archive bytes: 14,652,076

Archive SHA-256: `918bafddcdfc73877e95f6dad8a15e3625eca96799368138a5fd6a44037d1bff`

Integrity: `unzip -tq` passed.

Static validation: `ids=502`, `images=7`, `forms=19`, `required_features=163`; HTML structure, local images, alt text, required features, hooks and service-worker checks passed.

Header repair: the actual site navigation remains one header; the nested assistant-panel header is a separate component. The desktop quick-social row was removed from the fixed navigation to prevent visual crowding. Fresh desktop and mobile header bounds have no out-of-viewport children.

AI form repair: generic input width rules were overriding the consent checkbox. v25.4 resets checkbox width to 16px, gives the consent span the remaining flex width and keeps the submit button on its own normal row. Desktop form height is 174px, consent row height is 25px and consent text width is 1082px. At 390px, form width is 324px, consent width is 324px and Bengali consent text width is 299px.

QR repair: `#toggle-contact-qr` toggles `#contact-qr-panel`, updates `aria-expanded` and label text, loads `contact-qr.png` at 192x192, and resets cleanly. On mobile the contained QR panel is 240px wide and stays inside the viewport.

Mobile QA: fresh 390x844 CDP test reported `scrollWidth=390`, no header/contact descendants outside the viewport, menu open/body lock/ARIA state pass, five utility controls present, QR toggle open/reset pass, and clean menu close/reset.

Runtime smoke QA: grounded SQLite assistant answer rendered after submit; AI consent text was no longer vertical; post-contact section order ended with comparison share, content release feed, status integration and AI studio; browser console had no uncaught error in tested paths.

Cache-busting: `style.css?v=25.4`, `script.js?v=25.4`

Service-worker cache: `rifat-portfolio-v25.3`
