# AI feature setup guide

## Default behavior

The AI Studio is usable without an AI provider. The grounded assistant, brief analyzer, fit interpreter, architecture explainer, case-study Q&A, safe code reviewer, accessibility rewriter, audience personalizer, build-log summarizer and natural-language navigator use curated public portfolio knowledge or local heuristics by default.

> The static bundle never contains an OpenAI, OpenRouter or other provider secret. The safe code reviewer never executes arbitrary Python or JavaScript.

## Optional protected endpoint

The existing Integration Settings panel accepts a public URL for the **Grounded AI endpoint**. The browser uses it only when the relevant consent checkbox is enabled. The endpoint should be a server or serverless function that owns provider credentials and validates the request.

Example request shapes:

```json
{"question":"What did Rifat build with SQLite?","mode":"grounded","language":"en"}
```

```json
{"task":"brief-analysis","text":"We need a Telegram bot for our team","language":"en"}
```

```json
{"task":"code-review","code":"def search(items, query): ...","language":"en"}
```

A response may contain `answer` or `summary`, and the grounded assistant may return a `sources` array with objects containing `label` and `href`. When the endpoint is unavailable or consent is not enabled, the interface returns to its local fallback.

## Privacy and security boundary

Do not put API keys in the Integration Settings field, HTML, JavaScript, local storage or a public repository. The endpoint should implement authentication where appropriate, request size limits, rate limiting, origin checks, prompt-injection defenses, provider timeout handling, logging minimization and a clear retention policy.

Project briefs and code snippets remain local unless the visitor explicitly enables the relevant consent checkbox and a configured endpoint is available. Do not send passwords, tokens, private client files, personal identifiers or production credentials to an AI provider.

## Grounding and publishing

The local assistant is grounded only in approved public portfolio content. It provides a source path to a relevant section where possible and reports a knowledge-boundary fallback when the answer is not present. Build-log summarization reads approved local release entries and never publishes automatically. Human review remains required before any generated note is added to the public feed.

## Feature boundaries

The Project Fit interpreter is a scope signal, not a quote or approval gate. The architecture explainer documents design responsibility, not a security certification. The code reviewer is a visible-pattern review, not a full static-analysis or penetration-test result. The accessibility rewriter improves wording locally but does not certify WCAG conformance. The audience personalizer changes local emphasis only and can be reversed by selecting the public view.
