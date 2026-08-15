# Advanced Portfolio Features — Setup Guide

এই portfolio একটি static HTML/CSS/JavaScript site। তাই সব interface feature এখনই কাজ করে, কিন্তু direct submission, generative AI এবং site-wide analytics-এর জন্য নিরাপদ server-side endpoint প্রয়োজন। Browser-এর ভিতরে কোনো secret API key রাখা যাবে না।

## 1. Contact form

`index.html`-এর contact form-এ এই attribute-এ HTTPS endpoint বসান:

```html
<form id="contact-form" data-form-endpoint="https://your-domain.example/api/contact">
```

Endpoint-টি JSON `POST` request হিসেবে `name`, `email`, `projectType`, `budget`, `subject` এবং `message` গ্রহণ করবে। সফল হলে যেকোনো JSON response দেওয়া যাবে; frontend success message দেখাবে। Endpoint না থাকলে form একটি pre-filled email draft খুলবে।

Telegram notification বা auto-reply চালু করতে endpoint-এর server-side অংশে Telegram Bot API বা email provider ব্যবহার করুন। Bot token, SMTP password কিংবা provider secret কখনো `index.html` বা `script.js`-এ রাখবেন না।

## 2. Build Notes newsletter

Newsletter form-এ provider endpoint বসান:

```html
<form id="newsletter-form" data-newsletter-endpoint="https://your-domain.example/api/newsletter">
```

Endpoint JSON `POST` request হিসেবে `email` এবং `source` গ্রহণ করবে। Endpoint খালি থাকলে visitor-এর email client-এ subscription request draft খুলবে।

## 3. Project-aware AI assistant

Default অবস্থায় assistant local project knowledge-base retrieval ব্যবহার করে। এটি external service-এ visitor-এর question পাঠায় না। Generative AI চালু করতে:

```html
<aside id="ai-assistant" data-ai-endpoint="https://your-domain.example/api/assistant">
```

Endpoint-এ `message` এবং `context` পাঠানো হবে। `context` হলো portfolio-এর project knowledge entries। Server-side endpoint context-কে system prompt হিসেবে ব্যবহার করে আপনার নির্বাচিত LLM provider-এ request পাঠাতে পারে এবং `{ "answer": "..." }` response ফেরত দেবে। API key অবশ্যই server environment variable-এ রাখবেন।

এই architecture-এ assistant আসলেই আপনার project data-ভিত্তিক retrieval context পায়; কোনো model-কে আপনার private file বা credential দেওয়া হয় না।

## 4. Owner analytics console

Owner view দেখতে portfolio URL-এর শেষে `?analytics=1` যোগ করুন:

```text
https://your-domain.example/?analytics=1
```

Static mode-এ console এই browser-এর local event count দেখায়—page view, project preview, assistant question এবং terminal command। এটি site-wide traffic dashboard নয়। Real analytics চাইলে protected JSON endpoint বসান:

```html
<section id="analytics-console" data-analytics-endpoint="https://your-domain.example/api/analytics">
```

Endpoint চাইলে এই shape-এর response দিতে পারে:

```json
{
  "visits": 128,
  "projectClicks": 41,
  "assistantQuestions": 17,
  "terminalCommands": 23,
  "recent": [
    { "name": "project_preview", "at": "2026-08-15T12:00:00Z" }
  ]
}
```

Admin authentication ছাড়া public endpoint-এ sensitive analytics data রাখবেন না। আরও নিরাপদ পদ্ধতি হলো privacy-conscious analytics provider ব্যবহার করা এবং owner dashboard provider-এর protected console থেকে দেখা।

## 5. LinkedIn link

আপনার LinkedIn profile URL এখনো দেওয়া হয়নি। তাই header ও footer-এ fake LinkedIn link দেওয়া হয়নি। URL পেলে placeholder `in` এবং `LinkedIn · add URL` replace করবেন।

## 6. Verification checklist

Local test-এর জন্য `index.html`, `style.css`, `script.js`, images এবং `Rifat-MD-Resume.pdf` একই deployment structure-এ রাখুন। তারপর normal URL-এ terminal, assistant, theme switch এবং contact fallback পরীক্ষা করুন। Analytics panel-এর জন্য `?analytics=1` ব্যবহার করুন। Endpoint configure না করলে fallback text দেখা স্বাভাবিক এবং এটি intentional—কারণ site fake success, fake testimonial বা fake traffic claim করে না.
