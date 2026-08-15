# নতুন Feature-যুক্ত Portfolio Netlify/Vercel-এ Live করার Guide

এই guide-টি `mdrashidulislam-portfolio-feature-upgrade.zip` package-এর জন্য। এটি plain static HTML, CSS এবং JavaScript site; কোনো build command বা npm install দরকার নেই।

## প্রথম প্রস্তুতি: GitHub repository ঠিক করুন

প্রথমে ZIP file extract করুন। ZIP-এর ভিতরের সব file repository-এর root folder-এ রাখবেন। Repository root-এ অন্তত নিচের file-গুলো থাকতে হবে:

```text
index.html
style.css
script.js
header-mr-logo.png
rifat-profile-original.jpg
project-mri-vault-relatable.webp
project-deepseek-telegram-relatable.webp
project-portfolio-relatable.webp
stack-constellation.webp
rifat-social-share-banner.jpg
favicon.svg
site.webmanifest
robots.txt
sitemap.xml
Rifat-MD-Resume.pdf
```

`index.html`-এর পাশে সব image, PDF ও utility file রাখবেন। Folder structure যদি বদলাতে চান, তাহলে HTML-এর `src` এবং `href` path-ও বদলাতে হবে।

GitHub-এ repository খুলে **Add file → Upload files** নির্বাচন করুন। Extract করা সব file drag-and-drop করুন, তারপর **Commit changes** চাপুন। Repository-তে `index.html` অবশ্যই root folder-এ থাকতে হবে।

## পদ্ধতি ১: Netlify-এ GitHub থেকে deploy

1. [Netlify](https://app.netlify.com/) খুলে GitHub account দিয়ে sign in করুন।
2. Dashboard থেকে **Add new project → Import an existing project** নির্বাচন করুন।
3. **Deploy with GitHub** নির্বাচন করে GitHub authorize করুন।
4. আপনার portfolio repository নির্বাচন করুন।
5. Build settings-এ নিচের values দিন:

| Setting | Value |
|---|---|
| Branch to deploy | `main` অথবা আপনার default branch |
| Build command | খালি রাখুন |
| Publish directory | `.` অথবা repository root |
|
6. **Deploy [repository-name]** চাপুন।

কিছুক্ষণ পরে Netlify একটি `*.netlify.app` URL দেবে। এরপর GitHub-এ নতুন commit করলেই Netlify automatically redeploy করবে।

### Netlify-এ ZIP drag-and-drop বিকল্প

শুধু দ্রুত preview/live link চাইলে [Netlify Drop](https://app.netlify.com/drop)-এ যান। ZIP নয়—আগে extract করা সম্পূর্ণ project folder drag-and-drop করুন। Folder-এর ভিতরে সরাসরি `index.html` থাকতে হবে।

## পদ্ধতি ২: Vercel-এ GitHub থেকে deploy

1. [Vercel](https://vercel.com/) খুলে GitHub account দিয়ে sign in করুন।
2. Dashboard থেকে **Add New → Project** নির্বাচন করুন।
3. GitHub repository list থেকে portfolio repository-এর পাশে **Import** চাপুন।
4. Project settings-এ নিচের values রাখুন:

| Setting | Value |
|---|---|
| Framework Preset | `Other` অথবা `Other/Static` |
| Root Directory | repository root (`./`) |
| Build Command | খালি রাখুন |
| Output Directory | খালি রাখুন অথবা `.` |
| Install Command | খালি রাখুন |
|
5. **Deploy** চাপুন।

Vercel কয়েক মুহূর্তের মধ্যে একটি `*.vercel.app` URL দেবে। GitHub-এর default branch-এ নতুন commit হলে Vercel automatically নতুন deployment তৈরি করবে।

## নতুন feature-গুলো deploy হওয়ার পর পরীক্ষা করুন

Live URL খোলার পরে এই checklist অনুসরণ করুন:

| পরীক্ষা | প্রত্যাশিত ফলাফল |
|---|---|
| Header | MR logo, theme toggle এবং language toggle দেখা যাবে |
| MRI Vault demo | Search PDFs, Retrieve a file এবং Show backup flow কাজ করবে |
| Case studies | Project tab পরিবর্তন করলে Problem, Thinking, Technical Decision, Challenge, Solution ও Outcome বদলাবে |
| GitHub widget | Public repository data load হবে; API unavailable হলে fallback message দেখা যাবে |
| Notes | তিনটি technical note expand/collapse হবে |
| Resume | `Download résumé (PDF)` চাপলে one-page ATS résumé download হবে |
| Social sharing | Open Graph/Twitter image হিসেবে `rifat-social-share-banner.jpg` ব্যবহৃত হবে |
| Mobile | 390px-এর কাছাকাছি viewport-এ header, hero ও cards ভেঙে যাবে না |

## Formspree direct contact submission চালু করা

Default অবস্থায় contact form mailto fallback ব্যবহার করে। Direct submission চালু করতে:

1. [Formspree](https://formspree.io/) account তৈরি করুন।
2. একটি form তৈরি করে endpoint copy করুন, যেমন `https://formspree.io/f/YOUR_FORM_ID`।
3. `index.html`-এ এই অংশটি খুঁজুন:

```html
<form class="contact-form" id="contact-form" data-form-endpoint="">
```

4. endpoint বসান:

```html
<form class="contact-form" id="contact-form" data-form-endpoint="https://formspree.io/f/YOUR_FORM_ID">
```

5. পরিবর্তনটি GitHub-এ commit করুন। Netlify/Vercel automatic redeploy করবে।

Endpoint না বসালে contact form pre-filled email draft হিসেবে কাজ করবে।

## Custom domain যুক্ত করা

### Netlify

Netlify project খুলে **Domain management → Add a domain** নির্বাচন করুন। আপনার domain লিখে DNS instructions অনুসরণ করুন। সাধারণত DNS provider-এ Netlify-এর দেওয়া CNAME বা A record যোগ করতে হয়।

### Vercel

Vercel project খুলে **Settings → Domains → Add** নির্বাচন করুন। Domain লিখে Vercel-এর দেওয়া DNS record আপনার domain provider-এ যোগ করুন। DNS propagate হলে Vercel HTTPS certificate automatically চালু করবে।

## Common problems

**Logo বা image দেখা যাচ্ছে না:** `header-mr-logo.png` এবং অন্য assets `index.html`-এর একই root folder-এ আছে কি না দেখুন। Filename-এর uppercase/lowercase মিলিয়ে দেখুন।

**Resume download হচ্ছে না:** `Rifat-MD-Resume.pdf` root folder-এ আছে কি না এবং HTML link-এ filename একই কি না দেখুন।

**পুরোনো version দেখা যাচ্ছে:** Browser hard refresh দিন—Windows-এ `Ctrl + F5`; mobile-এ private/incognito window ব্যবহার করে দেখুন।

**Vercel/Netlify build failure:** এই site-এর জন্য কোনো build command লাগবে না। Build command, install command এবং output directory খালি রেখে repository root deploy করুন।

**Form কাজ করছে না:** Formspree endpoint বসানো হয়েছে কি না এবং endpoint active কি না দেখুন। Endpoint না থাকলে mailto fallback-এর জন্য visitor-এর device-এ email app configured থাকতে হবে।

## Recommended choice

GitHub repository থেকে নিয়মিত update করতে চাইলে **Netlify বা Vercel-এর Git deployment** ব্যবহার করুন। Beginner-friendly dashboard এবং সহজ form/domain setup-এর জন্য Netlify সুবিধাজনক; দ্রুত preview deployment ও Git-based workflow-এর জন্য Vercelও ভালো। দুটির ক্ষেত্রেই এই static portfolio-তে build command প্রয়োজন নেই।
