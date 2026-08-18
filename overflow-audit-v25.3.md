# v25.3 overflow audit

Desktop 1280px audit before the patch reported `document.scrollWidth=1265` against `innerWidth=1280`, so the page itself had no horizontal document overflow. The contact section was `1265px` wide, `overflow:hidden`, and its form fields stayed inside their `490px` column. The top `.site-nav` was `1080px` wide with visible overflow and a crowded flex row containing brand, eight navigation links, four quick social items and five utility controls; this was the likely source of header content leaving the visible range.

A fresh 390px CDP audit reported `scrollWidth=390`, no contact or header child outside the viewport, and mobile menu behavior passing: open state, body scroll lock, `aria-expanded=true`, five mobile utility controls, and clean close/reset. The visual patch therefore targets desktop header crowding plus robust wrapping/min-width containment for long contact, consent and AI copy rather than adding a global layout shift.

The v25.3 patch adds `overflow-x:clip`, `min-width:0` to layout/grid/form surfaces, shrinkable header children, narrower desktop gaps, controlled tablet layout and mobile navigation containment, plus `overflow-wrap:anywhere` for contact and consent copy. Cache-busting is updated to `style.css?v=25.3` and `script.js?v=25.3`; service-worker cache is `rifat-portfolio-v25.2`.
