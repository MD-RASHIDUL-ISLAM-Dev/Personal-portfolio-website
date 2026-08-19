# GitHub Pages-এর জন্য পরিষ্কার Upload Package

এই folder-এ শুধু deploy করার প্রয়োজনীয় static files রাখা হয়েছে। GitHub repository-তে এই folder-এর **ভেতরের files** upload করতে হবে; `github-pages-v37.0-motion-clean` নামে আলাদা folder upload করা যাবে না। এই package-এর current runtime release v37.1 AI panel repair layer।

## Repository structure

`index.html` অবশ্যই repository-এর একেবারে root-এ থাকতে হবে। একই root-এ `style.css`, `script.js`, `proof-flow-layer.js`, `motion-graphics.js`, `startup-recovery.js`, `sw.js`, images এবং `site.webmanifest` থাকবে। কোনো `resume/`, `qa/`, `cdp_*.js`, `backup/` বা পুরোনো version file upload করার প্রয়োজন নেই।

## GitHub Pages setup

Repository খুলে **Settings → Pages**-এ যান। Source হিসেবে **Deploy from a branch**, branch হিসেবে `main`, এবং folder হিসেবে `/ (root)` নির্বাচন করে Save করুন। GitHub যে Pages URL দেবে, সেটি নতুন private tab-এ খুলে পরীক্ষা করুন।

## Upload-এর পরে প্রথম mobile check

পুরোনো site একই custom domain বা repository path-এ আগে খোলা থাকলে browser-এর service worker পুরোনো build ধরে রাখতে পারে। ফোনে ওই site-এর browser settings থেকে site data/cache clear করুন, browser পুরোপুরি বন্ধ করে আবার খুলুন, তারপর private tab-এ Pages URL খুলুন। `?fresh=37.1` query যোগ করেও পরীক্ষা করতে পারেন।

## গুরুত্বপূর্ণ

এই package-এ `motion-failsafe.js` active load path-এ নেই, কারণ সেটিই mobile menu click-এর সময় browser unresponsive করার প্রমাণিত blocker ছিল। `startup-recovery.js` lightweight fallback হিসেবে রাখা হয়েছে।
