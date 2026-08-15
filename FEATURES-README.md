# Rifat Portfolio — Latest Feature Upgrade

এই package-টি latest static HTML/CSS/JavaScript portfolio-এর উপর তৈরি। Existing dark navy–gold editorial identity, approved portrait, project artwork, case studies, GitHub snapshot, résumé download এবং responsive behavior বজায় রেখে নতুন conversion ও AI-oriented features যোগ করা হয়েছে।

## এখন যা আছে

Header ও footer-এ Email, GitHub এবং Telegram shortcuts রয়েছে। LinkedIn URL user-provided না হওয়ায় সেখানে fake link না দিয়ে pending marker রাখা হয়েছে। Contact form-এ Name, Email, Project Type, Budget, Subject এবং Message fields আছে। Endpoint না থাকলে form pre-filled email draft খোলে; secure provider endpoint বসালে JSON POST submission চালু হবে।

Build Notes newsletter section-এ email capture রয়েছে। Provider endpoint না থাকলে subscription request email draft হিসেবে খোলে। Existing technical notes section-এ fuzzy search, Termux practice এবং practical LLM workflow নিয়ে compact publishing-ready notes রয়েছে।

`rifat@studio:~$` terminal simulator-এ `help`, `projects`, `skills`, `notes`, `contact`, `github` এবং `clear` commands কাজ করে। Commands strictly local map থেকে response দেয় এবং কোনো system command execute করে না। Hero headline Telegram AI Bots, LLM Systems, Responsive Web Apps এবং Agentic AI Workflows-এর মধ্যে type করে rotate হয়।

Floating project assistant default-এ local project knowledge-base retrieval ব্যবহার করে। Visitor services, MRI Vault, DeepSeek Bot, skills, portfolio বা contact সম্পর্কে প্রশ্ন করতে পারে। `data-ai-endpoint`-এ secure server endpoint বসালে একই project context generative AI endpoint-এ পাঠানো যাবে; browser code-এ কোনো API key রাখা হয়নি।

`?analytics=1` query করলে owner console দেখা যায়। Default static mode এই browser-এর local page view, project preview, assistant question এবং terminal command count দেখায়। Site-wide analytics-এর জন্য protected JSON endpoint প্রয়োজন; public client-side code-এ admin credential রাখা যাবে না।

Dark/light theme, Bengali/English key-heading toggle, reduced-motion handling, responsive mobile assistant launcher, visible focus states এবং scroll/hover micro-interactions বজায় আছে। ATS-friendly one-page résumé, social-sharing banner, favicon, manifest, robots.txt এবং sitemap-ও package-এ আছে।

## গুরুত্বপূর্ণ honest limitations

Generative AI chat, direct contact delivery, newsletter storage, Telegram notification এবং site-wide analytics static HTML-এ secureভাবে সরাসরি চালু করা যায় না। এই package-এ তাদের জন্য safe UI, local fallback এবং exact endpoint hooks রাখা হয়েছে। `ADVANCED-FEATURES-SETUP.md`-এ endpoint contract ও deployment instructions রয়েছে। কোনো fake testimonial, fake uptime percentage, fake analytics total বা fake AI claim ব্যবহার করা হয়নি।

## Deployment

ZIP extract করে `index.html`, `style.css`, `script.js`, local images, `Rifat-MD-Resume.pdf` এবং utility files একই deployment root structure-এ রাখুন। Netlify বা Vercel-এ এটি plain static site হিসেবে deploy করুন; build command এবং install command প্রয়োজন নেই।

## New conversion and proof layer

The current build now includes Project Fit Quiz 2.0 with budget, deadline, platform, integration and complexity inputs. It returns a service recommendation, realistic starting scope and relevant case-study link without publishing invented price or delivery promises.

The interactive project brief generator turns visitor answers into a structured plain-text brief. Visitors can download it locally, open a prepared email draft, or share it through Telegram. A project comparison export creates a downloadable comparison and a shareable `?compare=` URL.

The technical-proof layer includes a safe embedded MRI Vault workflow, architecture trade-offs, failure-handling notes, security boundaries, lessons learned and a structured open-source timeline. The availability calendar shows current status, next opening, response target and collaboration criteria as planning signals rather than guaranteed bookings.

A compact section table of contents synchronizes with the active-section beacon and primary navigation. The assistant and visual case-study dialog retain keyboard focus correctly, while the expanded controls include visible focus rings, reduced-motion support and English/Bangla localization for the new fit-selection labels.

The PWA shell now uses a versioned service-worker cache (`rifat-portfolio-v22`) covering the core HTML/CSS/JS, manifest, favicon, SEO files, résumé, artwork and share assets. The client-portal section is intentionally a static-safe preview only: it demonstrates brief, milestone and handover states, while real authentication, private files and confidential client data require a protected backend before production use.

## Full Bengali Mode

The language toggle now localizes the full user-facing portfolio experience rather than only selected headings. It covers navigation, skip links, hero and about copy, services, capability tabs, project cards, bot walkthrough, case-study tabs and modal fields, architecture and proof copy, GitHub status labels, open-source timeline, notes, changelog, terminal prompt and responses, project comparison, Fit Quiz 2.0, structured brief generator, availability, client portal preview, contact/newsletter feedback, assistant responses, accessibility labels, placeholders and page title. Proper names, repository names, URLs and technical stack identifiers remain unchanged where translation would reduce clarity. English mode has a separate regression path and remains the default fallback.

The service worker cache is currently versioned as `rifat-portfolio-v22` so deployed visitors receive the latest feature and localization scripts instead of a stale cached build.


## pasted_content.txt feature coverage

The direct contact form already includes a secure `data-form-endpoint` hook with JSON submission, validation, endpoint-error fallback and a prepared email draft. The AI assistant uses a curated local knowledge base by default and accepts an optional secure server endpoint without exposing browser-side API keys. The feedback section deliberately publishes no invented testimonial; it provides a permission-based verified-feedback path instead. The new Outcome Evidence section separates verifiable proof from future metrics that must be instrumented through a protected endpoint.

Discovery-call intent now has a configured-URL hook through `data-booking-url`. When the URL is empty, the visitor is routed to the project brief flow and the owner receives an honest configuration message rather than a fake calendar. Project-specific case-study deep links, the Now Building changelog, availability view, embedded Telegram workflow, architecture map, open-source timeline, PWA shell, privacy-safe local analytics, client-portal preview, focus management, reduced-motion support, full Bengali localization, Project Fit Quiz 2.0 and structured brief generator are included.

Field Notes now includes client-side search, topic tags and a live result count. It works without a backend and keeps the editorial notes discoverable as the section grows. Real newsletter/contact delivery, automatic Telegram notifications, real private portal authentication and site-wide metrics still require protected provider or server configuration; the static package includes safe hooks and explicit fallback states for each.

The service worker cache is currently versioned as `rifat-portfolio-v22`. The package also includes the static `feed.xml` RSS feed, a local interactive demo lab, a non-executing code playground, recruiter mode, client onboarding flow, case-study share metadata, print/PDF brief action and a local accessibility audit surface. The v18 decision layer adds a proof ledger, case-study decision replay, scenario builder, project readiness meter, architecture SVG export, changelog diff viewer, API boundary notes, engineering principles, permissioned feedback preview, portable JSON/Markdown profile export, keyboard guide, PWA install guidance and reading mode.


## Targeted feature upgrades from the latest recommendation list

The stack image is now accompanied by an interactive SVG network map. Each focusable node exposes the tool name and the public projects where that tool is used. The hero also includes a Currently Building signal that reads a recent public GitHub event when available and falls back to a manual active-build label when the public activity endpoint is unavailable.

A small open-source snippet library now provides educational SQLite backup, Telegram bot and reduced-motion starter snippets with copy-to-clipboard actions. The new stage-based project timeline explains the self-taught progression without inventing calendar dates. A meta case study documents why the site uses framework-free HTML/CSS/JavaScript, how motion is balanced with accessibility, and why proof is prioritized over decoration.

The services area now includes non-binding starting-scope signals for a focused bot, an LLM/RAG integration and a full-stack product foundation. These are not fixed quotes; final pricing still depends on the brief, integration surface and delivery constraints. The existing live bot preview, GitHub activity, résumé download, booking hook, newsletter hook, Bengali/English mode, case-study evidence and honest uptime boundary remain intact.

A Simplified View control persists locally and reduces non-essential animation, hides the dust canvas layer, disables the hero aura and restores reveal content for motion-sensitive or lower-power devices. Privacy-friendly analytics remain local by default; a protected provider or endpoint must be configured before any site-wide analytics or real uptime metrics are published.

The service worker cache is currently versioned as `rifat-portfolio-v22`. The package also includes the static `feed.xml` RSS feed, a local interactive demo lab, a non-executing code playground, recruiter mode, client onboarding flow, case-study share metadata, print/PDF brief action and a local accessibility audit surface. The v18 decision layer adds a proof ledger, case-study decision replay, scenario builder, project readiness meter, architecture SVG export, changelog diff viewer, API boundary notes, engineering principles, permissioned feedback preview, portable JSON/Markdown profile export, keyboard guide, PWA install guidance and reading mode.


## AI and visitor-utility upgrades

The existing project-aware assistant is now visibly positioned as **Ask about me**. It remains local-retrieval-first and accepts an optional secure server endpoint through `data-ai-endpoint`; browser-side model credentials are never required. A keyboard-first Cmd/Ctrl+K command palette now routes visitors to the main sections, the assistant and the résumé print view.

The new Now page records current building, learning and next publishing direction. A separate status surface is ready for a protected public JSON endpoint; until configured, it intentionally shows monitoring state rather than fabricated uptime or response-time values. The page also exposes a reading-progress percentage and a print-resume action that temporarily creates a clean résumé-oriented browser print view.

GitHub activity now includes a hand-rendered SVG heatmap built from the public events endpoint, with no third-party badge dependency. Skills cards now carry `data-verified-in` project proof tags that appear in the card evidence line and remain aligned with the honesty-first positioning.

The service worker cache is currently versioned as `rifat-portfolio-v22`. The package also includes the static `feed.xml` RSS feed, a local interactive demo lab, a non-executing code playground, recruiter mode, client onboarding flow, case-study share metadata, print/PDF brief action and a local accessibility audit surface. The v18 decision layer adds a proof ledger, case-study decision replay, scenario builder, project readiness meter, architecture SVG export, changelog diff viewer, API boundary notes, engineering principles, permissioned feedback preview, portable JSON/Markdown profile export, keyboard guide, PWA install guidance and reading mode.


## v20 Trust, Performance and Handoff Layer

The v20 release adds a local Performance Budget panel using the measured v19 snapshot as a reference and browser Resource Timing when available. It intentionally avoids publishing a fabricated Lighthouse score or field-user Web Vitals claim. The Privacy Center explains what stays in local storage, what is not sent by default, and where protected provider configuration would be required; it also provides a local-preference and local-analytics reset action.

A Project Anti-Fit section makes collaboration boundaries explicit: unclear ownership, guaranteed outcomes and uninstrumented claims are not presented as acceptable defaults. The Outcome Measurement Planner creates a workflow-specific first measurement plan for retrieval, assistant, automation or interface work. It is a conversation starter and never reports a promised result.

The contact area now provides a local vCard download and a scannable QR image pointing to the public contact section. The QR asset is packaged locally and cached by the v20 service worker; no external QR generator or runtime dependency is used. Contact delivery, newsletter delivery, AI generation, booking and monitoring remain protected configuration hooks.

The v20 service-worker cache is `rifat-portfolio-v22`, and the validator checks the new feature IDs, QR image, local hooks and cache version.


## v21 Contrast and Mobile Navigation Pass

The v21 pass corrects the light-theme navigation, contact links, utility controls, footer links and several proof/measurement surfaces with explicit readable colors and opaque light backgrounds where transparency could reduce contrast. The page retains the navy/gold editorial identity in dark mode and uses a warm paper/light-blue contrast system in light mode.

The mobile header now uses a stable two-column top row: the brand remains on the left and the hamburger remains on the right. Secondary display controls move into the opened menu, the menu has a viewport-constrained scroll area, the page locks while the menu is open, and Escape, link selection and utility-button actions close it safely. The desktop utility row remains unchanged at larger breakpoints.

The current service-worker cache is `rifat-portfolio-v23`; the static validator and browser QA cover the corrected theme and responsive header surfaces.


## v22 Trust and Reliability Layer

The v22 release adds a static-safe Security Posture Explorer for token, private-state, user-input and provider boundaries. It is an engineering explanation, not a security certification or penetration-test result.

A Failure-Handling Simulator demonstrates readable recovery patterns for API timeouts, empty search results, unavailable LLM providers and incomplete backups. It never contacts a live service and never invents an uptime or AI result.

The Recruiter One-Page Snapshot provides a concise printable and downloadable summary of role, proof, working style and contact handoff. The Deployment Readiness Inspector runs browser-local checks for markup, navigation, stylesheet/script presence, PWA metadata, image references, provider hooks and RSS metadata. The Accessibility Preference Center stores reduced motion, high contrast, larger text and focus-mode preferences locally only.

The current service-worker cache is `rifat-portfolio-v23`; all new sections use the existing Bengali/English localization path, keyboard focus treatment, light-theme contrast rules and responsive mobile layout.


## v23 Readability and Light-Mode Correction

The v23 readability pass addresses the remaining light-mode legibility issue across the full static page rather than only changing one navigation selector. It establishes explicit light-theme slate and gold tokens, readable backgrounds for translucent cards, stronger muted-text colors, larger body/supporting copy, more open line-height, readable form controls, and clearer project, skill, status, recruiter, deployment and accessibility metadata.

Important controls and labels now use a consistent readable scale, while the editorial display headings and dark navy/gold identity remain intact. Bengali mode receives reduced artificial letter spacing and a more open line box so Bengali glyphs remain easier to scan. The existing large-text preference now covers navigation, forms, helper notes, metadata, trust panels and interactive labels rather than only a small subset of paragraphs. Stylesheet cache-busting is set to `style.css?v=23.4`, and the service-worker cache is `rifat-portfolio-v23`.


## v24 Integration, Proof and Delivery Layer

The v24 release adds a browser-local Integration Settings surface for public endpoint URLs. Contact, safe demo, analytics, status and newsletter providers can be configured without placing credentials in the repository. Empty fields keep the local fallback, and values are stored only in the current browser's local storage.

The Project Proof Lab provides project-specific read-only previews with a protected demo endpoint hook. Repository Detail exposes current state, public proof, stack, next milestone and repository link for MRI PDF Archive Vault, DeepSeek Telegram AI Bot and the portfolio system. The Guided Portfolio Tour is dismissible and moves visitors through positioning, proof, case study and contact.

A dedicated `resume.html` route provides a recruiter-focused print-friendly page. The Print-ready Brief surface connects the existing brief generator to the browser's native Print / Save as PDF flow, without claiming server-certified PDF generation. The Shareable Comparison surface encodes only a public project selection in its URL and never includes private form data.

The Content Release Feed reads an editable first-party `content-releases.json` file and remains compatible with the existing RSS/Atom feed. Status Integration exposes the configured JSON status contract while keeping the honest unconfigured state when no endpoint is supplied. The new service-worker cache is `rifat-portfolio-v24`, and the main stylesheet and script use `style.css?v=24.0` and `script.js?v=24.0` cache-busting references.

These integrations are intentionally hooks rather than invented live services. Before production use, connect a protected endpoint with server-side validation, rate limiting, origin checks, secret management and privacy policy appropriate to the chosen provider.


## v25 AI Studio

The v25 release adds an AI Studio that demonstrates practical AI integration without exposing a browser key. The Grounded Assistant answers questions from curated public portfolio knowledge and links to a source section. If a protected endpoint is configured and the visitor explicitly consents, the same surface can use a server-owned AI provider; otherwise it remains local.

The studio includes a Project Brief Analyzer for missing discovery inputs and risk signals, a Project Fit Interpreter, an Architecture Explainer, project-specific Case-study Q&A, a Safe Code Review surface that never executes arbitrary code, a local Accessibility Rewriter, audience personalization, an approved Build-log Summarizer and a natural-language project navigator.

All AI outputs carry a local, protected-endpoint or boundary state. Brief and code text remain local unless the relevant consent checkbox is enabled with a configured endpoint. No automatic publishing, fake metric, security certification, guaranteed estimate or provider claim is generated. Bengali/English labels, light-mode contrast, reduced motion, keyboard focus and mobile stacking are included. The current service-worker cache is `rifat-portfolio-v25`, and cache-busted assets use `style.css?v=25.0` and `script.js?v=25.0`.
