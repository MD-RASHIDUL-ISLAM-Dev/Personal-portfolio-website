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

The PWA shell now uses a versioned service-worker cache (`rifat-portfolio-v6`) covering the core HTML/CSS/JS, manifest, favicon, SEO files, résumé, artwork and share assets. The client-portal section is intentionally a static-safe preview only: it demonstrates brief, milestone and handover states, while real authentication, private files and confidential client data require a protected backend before production use.

## Full Bengali Mode

The language toggle now localizes the full user-facing portfolio experience rather than only selected headings. It covers navigation, skip links, hero and about copy, services, capability tabs, project cards, bot walkthrough, case-study tabs and modal fields, architecture and proof copy, GitHub status labels, open-source timeline, notes, changelog, terminal prompt and responses, project comparison, Fit Quiz 2.0, structured brief generator, availability, client portal preview, contact/newsletter feedback, assistant responses, accessibility labels, placeholders and page title. Proper names, repository names, URLs and technical stack identifiers remain unchanged where translation would reduce clarity. English mode has a separate regression path and remains the default fallback.

The service worker cache is currently versioned as `rifat-portfolio-v11` so deployed visitors receive the latest localization script instead of a stale cached build.
