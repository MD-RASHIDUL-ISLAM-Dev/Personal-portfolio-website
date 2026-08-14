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
