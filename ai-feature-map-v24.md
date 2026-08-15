# v24 → AI feature expansion map

| Requested AI feature | Existing v24 surface | AI enhancement boundary |
|---|---|---|
| Grounded Ask about Rifat assistant | `#ai-assistant`, `#ai-form`, `#ai-messages`, `data-ai-endpoint` | Expand local retrieval knowledge into source-linked answers; optional protected endpoint; no browser API key. |
| AI Project Brief Analyzer | `#brief-generator`, `#brief-form`, `#brief-output` | Add analyzer output for missing requirements, scope risks, integration risks and first milestone; local heuristics first, optional protected endpoint second. |
| AI Architecture Explainer | `#architecture-map`, `#architecture-export`, architecture tabs | Add node explainer panel and optional protected explanation endpoint; default to curated descriptions. |
| AI Project Fit Interpreter | `#fit-quiz-form`, `#fit-quiz-result` | Add AI-style interpretation of current quiz values, with scope signal and uncertainty boundary rather than fixed quote. |
| AI Case-study Q&A | `#case-studies`, `#deep-dive-panel`, `#deep-*` fields | Add project-specific question input and local grounded answer with section/source anchor. |
| Safe AI Code Review Playground | `#code-playground`, `#code-playground-editor`, `#code-playground-run` | Add static code review rubric; no arbitrary code execution; optional protected review endpoint only. |
| AI Accessibility Rewriter | `#accessibility-audit`, `#privacy-center`, forms | Add local rewrite modes for client-friendly, Bengali, recruiter and plain-language summaries; input remains local by default. |
| Audience personalization | `#recruiter-toggle`, `#fit-quiz`, `#command-palette` | Add audience selector that changes visible priority/CTA, persisted locally and reversible. |
| Build-log summarizer | `#content-release-feed`, `content-releases.json`, `feed.xml` | Add local summary preview from approved release records; no automatic publishing. |
| Natural-language project navigator | `#command-palette`, existing keyboard navigation | Add query interpreter for phrases like “show Python projects”; fallback to existing command filter. |

## Shared safety requirements

All AI additions must show whether the answer came from **local curated knowledge**, a **configured protected endpoint**, or an **unavailable fallback**. No secret, token or credential may enter HTML, CSS, JavaScript, localStorage or the public repository. User-entered brief/code text stays local unless an explicit consent checkbox is enabled and a protected endpoint is configured. Arbitrary Python or JavaScript is never executed in the browser. AI responses must not claim real metrics, certifications, guaranteed outcomes or facts not present in the curated public knowledge base.

## Shared UX requirements

Every new surface receives Bengali/English labels, keyboard focus, readable light-mode contrast, reduced-motion compatibility, empty/error states, source links where appropriate and a compact mobile layout. Existing assistant, brief, architecture, quiz, case-study, playground, accessibility, recruiter and command-palette surfaces remain the primary interaction points.
