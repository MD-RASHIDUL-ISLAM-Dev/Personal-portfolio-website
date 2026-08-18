External service notes collected on 2026-08-14:

Formspree official site: https://formspree.io/
Formspree HTML forms guide: https://formspree.io/html/
Formspree help — building an HTML form: https://help.formspree.io/articles/building-your-form/building-an-html-form
Formspree help — JavaScript/AJAX form submission: https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax

Key implementation detail: Formspree provides a hosted form endpoint for static HTML/JavaScript sites. The form endpoint/ID is obtained from the Formspree dashboard. This portfolio keeps `data-form-endpoint` empty by default and falls back to a mailto draft; the owner can paste the real endpoint into that attribute after creating the form.
