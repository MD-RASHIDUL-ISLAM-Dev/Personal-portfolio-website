# Motion Graphics Release v37.0

This release adds a performance-safe motion layer without making essential content depend on JavaScript animation.

## Added

The desktop view receives a low-density ambient constellation canvas with small particles, restrained connections, pointer-aware signal lines, visibility pause, resize handling and a capped render cadence of approximately 24 frames per second. Cards receive a short hover lift and sheen effect on fine-pointer devices.

The mobile view uses a CSS-only ambient gradient drift. The canvas is disabled below 900px, so mobile devices do not pay the cost of the particle loop. Reduced-motion preferences and data-saver mode disable decorative motion entirely.

## Safety guarantees

The motion script is wrapped in a failure-safe boundary. It never changes content visibility, page overflow, menu state, or button bindings. The canvas has `pointer-events: none`, so it cannot intercept clicks. Existing startup recovery remains active.

## QA

Fresh 360px and 1280px tests passed with complete document rendering, `overflowY: auto`, successful menu open/close, scroll to 1,200px, AI launcher open/close, and Contact QR open/close. The final visual check confirmed that the fixed desktop navigation and mobile header remain correctly positioned above the ambient layer.
