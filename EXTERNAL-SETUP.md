# Portfolio external setup

## GitHub activity widget

The GitHub activity panel reads public data directly in the browser from the GitHub public REST API for `MD-RASHIDUL-ISLAM-Dev`. No token is required. If the API is rate-limited or unavailable, the widget shows a direct-profile fallback instead of fake numbers.

## Direct contact submission with Formspree

The contact form works immediately with a `mailto:` fallback. To enable direct browser submission without opening an email client:

1. Create a form at [Formspree](https://formspree.io/).
2. Copy the form endpoint shown in the Formspree dashboard. It normally looks like `https://formspree.io/f/YOUR_FORM_ID`.
3. Open `index.html` and change the empty attribute below:

```html
<form class="contact-form" id="contact-form" data-form-endpoint="">
```

to:

```html
<form class="contact-form" id="contact-form" data-form-endpoint="https://formspree.io/f/YOUR_FORM_ID">
```

The JavaScript sends JSON with `name`, `email`, `subject`, and `message`. If the endpoint fails, the site automatically falls back to a pre-filled email draft.

## Optional bot uptime badge

The MRI Vault preview deliberately does not invent an uptime percentage. If you later expose a public JSON status endpoint, set it on the `#bot-uptime` element:

```html
<span class="bot-uptime" id="bot-uptime" data-uptime-endpoint="https://your-status-endpoint.example/status">Monitoring endpoint not configured</span>
```

The endpoint should return a small JSON object such as:

```json
{"status":"up","uptime":"99.9%"}
```

## Theme and language

The dark theme is the default brand presentation. Visitors can switch to light mode and Bengali navigation/headings using the controls in the header. Both choices are saved in `localStorage` for that browser.

## Resume

Keep `Rifat-MD-Resume.pdf` in the same root folder as `index.html`. The contact section links to it with a download attribute.

## Source references

[Formspree](https://formspree.io/) · [Formspree HTML forms](https://formspree.io/html/) · [Formspree HTML form guide](https://help.formspree.io/articles/building-your-form/building-an-html-form) · [Formspree JavaScript/AJAX guide](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax)


## v24 public integration settings

The v24 Integration Settings section lets you save public endpoint URLs in the current browser without editing the HTML. It supports five optional hooks:

| Hook | Expected behavior |
|---|---|
| Contact submission | Accept a JSON `POST` containing `name`, `email`, `subject`, `projectType`, `budget` and `message`. |
| Safe demo | Accept a read-only JSON `POST` containing `project` and `mode: "read-only"`; return an optional `summary`. |
| Analytics read | Return aggregate JSON such as `{"visits":0,"projectClicks":0,"assistantQuestions":0,"terminalCommands":0,"recent":[]}`. |
| Status | Return a JSON object with optional `mri`/`archive` and `deepseek` service objects. Each object may contain `status`, `up` and `responseMs`. |
| Newsletter | Accept a JSON `POST` containing `email` and `source`. |

The browser stores only these URLs under the `rifat-public-integration-hooks` local-storage key. It never stores API keys or secrets. Clear the hooks to return to the local fallback state.

For production, put validation, rate limiting, CORS/origin checks, secret management and provider credentials on a server or serverless function. Do not paste private tokens into `index.html`, `script.js`, the Integration Settings fields or any public repository.

## v24 recruiter and content routes

`resume.html` is a standalone print-friendly recruiter route. It can be opened directly on GitHub Pages, Netlify or Vercel and does not require a build command. The print button delegates to the browser's native print dialog; selecting **Save as PDF** creates the visitor's local PDF copy.

`content-releases.json` is the editable source for the Content Release Feed. Update its public release objects, then keep `feed.xml` aligned when publishing a permanent note. The portfolio continues to work if the JSON feed cannot be loaded.

## v24 status contract

The status surface intentionally reports configuration state until a protected status endpoint is connected. A compatible response can look like:

```json
{
  "mri": {"status": "up", "responseMs": 240},
  "deepseek": {"status": "unknown"}
}
```

Do not publish uptime, response-time or availability claims unless the endpoint is instrumented and the numbers are genuinely measured.


## v25 AI Studio endpoint

The v25 AI Studio is local-first. To enable protected AI responses, put a server or serverless URL into the **Grounded AI endpoint** field in Integration Settings. The browser sends a request only when the relevant consent checkbox is enabled.

Supported task shapes are:

| Task | JSON fields |
|---|---|
| Grounded assistant | `question`, `mode`, `language` |
| Brief analysis | `task: "brief-analysis"`, `text`, `language` |
| Code review | `task: "code-review"`, `code`, `language` |

A response may contain `answer` or `summary`. Grounded answers may also return `sources`, an array of `{label, href}` objects. The client falls back to curated local knowledge if the endpoint is empty, unavailable or returns an invalid response.

Never put provider credentials in the static bundle or in the public Integration Settings field. The protected endpoint must own the key, validate and limit input, enforce origin/rate controls, handle timeouts, minimize logs and define retention/deletion behavior. Brief and code inputs should not be sent without explicit visitor consent.
