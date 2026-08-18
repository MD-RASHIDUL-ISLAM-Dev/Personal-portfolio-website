#import "@preview/basic-resume:0.2.9": *

#let name = "MD Rashidul Islam (Rifat)"
#let location = "Narsingdi, Bangladesh"
#let email = "rashidulislamrifat14708@gmail.com"
#let github = "github.com/MD-RASHIDUL-ISLAM-Dev"
#let phone = "+880 1737-608355"
#let personal-site = "mdrashidulislam.kdns.fr"

#show: resume.with(
  author: name,
  location: location,
  email: email,
  github: github,
  phone: phone,
  personal-site: personal-site,
  accent-color: "#8a6014",
  font: "New Computer Modern",
  paper: "us-letter",
  author-position: left,
  personal-info-position: left,
)

== Professional Summary
Self-taught Full-Stack AI Engineer from Narsingdi, Bangladesh, building Telegram AI bots, LLM workflows, Python automation utilities, and responsive web interfaces. Focused on turning complex ideas into practical software through clear architecture, useful interfaces, and dependable delivery.

== Core Competencies
- AI application development, LLM API orchestration, prompt engineering, RAG-oriented workflows, and conversational interfaces
- Telegram bot architecture, document search and retrieval flows, SQLite-backed state, automation utilities, and deployment handover
- Responsive frontend engineering with semantic HTML, modern CSS, vanilla JavaScript, accessibility practices, and deliberate interaction design

== Selected Projects

#project(
  name: "MRI PDF Archive Vault",
  role: "Builder",
  url: "t.me/MRI_PDF_ARCHIVE_Bot",
)
- Built a Telegram-based PDF storage and retrieval workflow with smart categorization, fuzzy search, reading progress tracking, and automated backups.
- Designed the system around a practical chat-first interface so users can search, retrieve, and revisit documents without leaving Telegram.
- Used Python, Telegram Bot API, SQLite, file-system workflows, and Termux-based deployment practices.
- Live bot: #link("https://t.me/MRI_PDF_ARCHIVE_Bot")[t.me/MRI_PDF_ARCHIVE_Bot] | Source: #link("https://github.com/MD-RASHIDUL-ISLAM-Dev/ri-pdf-vault-bot")[GitHub repository]

#project(
  name: "DeepSeek Telegram AI Bot",
  role: "Builder",
)
- Designed a conversational Telegram chatbot direction that integrates DeepSeek R1 through the OpenRouter API.
- Planned the interaction around a focused conversation loop, readable responses, model routing, and future API fallback options.
- Used Telegram Bot API, OpenRouter, DeepSeek R1, prompt engineering, and Python-oriented workflow design.
- Status: Active build; source release planned after completion.

#project(
  name: "Personal Portfolio Website",
  role: "Designer and Developer",
  url: "mdrashidulislam.kdns.fr",
)
- Built a single-page portfolio with an editorial layout, responsive navigation, project filtering, case-study previews, dark/light theme controls, and Bengali/English language switching.
- Implemented vanilla JavaScript interactions including terminal typing, constellation particles, card spotlight effects, keyboard-accessible dialogs, and a public GitHub activity widget.
- Used semantic HTML5, modern CSS, JavaScript ES6+, Canvas API, responsive design, and local visual assets.
- Live demo: #link("https://www.mdrashidulislam.kdns.fr/")[mdrashidulislam.kdns.fr] | Source: #link("https://github.com/MD-RASHIDUL-ISLAM-Dev/Personal-portfolio-website")[GitHub repository]

== Technical Skills
- *AI and LLM*: OpenRouter API, DeepSeek R1, prompt engineering, conversational AI workflows, RAG concepts, MCP protocol
- *Programming*: Python, JavaScript ES6+, HTML5, CSS3, SQLite, AsyncIO
- *Backend and Automation*: Telegram Bot API, file-system automation, document retrieval, backups, state management
- *Frontend*: Semantic HTML, modern CSS, responsive layouts, accessibility, Canvas API, interaction design
- *Tools and Environment*: Git, GitHub, GitHub Pages, Termux on Android, Windows development workflow

== Engineering Approach
- Start with the real user problem and define a focused first version.
- Keep system layers understandable: interface, data, integrations, state, and handover.
- Prefer useful, testable software over decorative complexity.

