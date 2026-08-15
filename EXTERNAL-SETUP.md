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
