from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).parent
HTML = ROOT / 'index.html'
text = HTML.read_text(encoding='utf-8')

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.images = []
        self.forms = []
        self.tags = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append(tag)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'img' and 'src' in attrs:
            self.images.append((attrs['src'], attrs.get('alt', '')))
        if tag == 'form':
            self.forms.append(attrs)

parser = Parser()
parser.feed(text)
errors = []
duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
if duplicates:
    errors.append(f'duplicate IDs: {duplicates}')
for src, alt in parser.images:
    if src.startswith(('./', 'assets/')):
        path = ROOT / src.removeprefix('./').removeprefix('assets/')
        if not path.exists():
            errors.append(f'missing image: {src}')
    if not alt.strip():
        errors.append(f'empty image alt: {src}')
required_ids = ['contact-form','ai-assistant','feedback','outcomes','availability','case-studies','now-building','notes-search','fit-quiz-form','brief-form','client-portal','analytics-console','recruiter-summary','onboarding','demo-lab','demo-sandbox-form','demo-sandbox-output','demo-reel','demo-reel-play','code-playground','code-playground-editor','code-playground-run','accessibility-audit','run-accessibility-audit','brief-print','reading-mode-toggle','proof-ledger','decision-replay','decision-replay-project','scenario-builder','scenario-form','scenario-output','readiness-meter','readiness-form','engineering-principles','changelog-diff','changelog-from','changelog-to','api-docs','copy-api-example','feedback-consent','feedback-consent-form','profile-export','profile-json-export','keyboard-guide','keyboard-guide-toggle','pwa-install-guide','pwa-install-button','reading-mode','architecture-export','performance-budget','run-performance-scan','privacy-center','privacy-clear-state','anti-fit','outcome-planner','outcome-planner-form','outcome-planner-copy-button','download-vcard','toggle-contact-qr','contact-qr-panel','contact-qr','download-contact-qr','security-posture','security-posture-output','failure-simulator','failure-simulator-form','failure-simulator-output','recruiter-snapshot','print-recruiter-snapshot','download-recruiter-snapshot','deployment-readiness','run-deployment-checks','deployment-readiness-results','accessibility-preferences','preference-reduced-motion','preference-high-contrast','preference-large-text','preference-focus-mode','reset-accessibility-preferences','integration-settings','integration-settings-form','integration-contact-endpoint','integration-demo-endpoint','integration-analytics-endpoint','integration-status-endpoint','integration-newsletter-endpoint','integration-settings-reset','project-proof-lab','proof-lab-project','proof-lab-run','proof-lab-state','proof-lab-output','repository-detail','repository-project','repository-detail-output','portfolio-tour','portfolio-tour-start','portfolio-tour-card','portfolio-tour-close','portfolio-tour-prev','portfolio-tour-next','resume-route','brief-pdf','brief-pdf-download','brief-pdf-state','comparison-share-panel','comparison-share-copy','content-release-feed','content-release-feed-load','content-release-feed-list','status-integration','status-integration-refresh','status-integration-output','integration-ai-endpoint','ai-studio','ai-studio-title','ai-grounded-qa','ai-grounded-form','ai-grounded-question','ai-grounded-consent','ai-grounded-output','ai-grounded-answer','ai-grounded-sources','ai-grounded-open','ai-brief-analyzer','ai-brief-analyzer-form','ai-brief-analyzer-input','ai-brief-analyzer-consent','ai-brief-analyzer-output','ai-fit-interpreter','ai-fit-interpreter-run','ai-fit-interpreter-output','ai-architecture-explainer','ai-architecture-output','ai-case-study-qa','ai-case-study-form','ai-case-study-project','ai-case-study-question','ai-case-study-output','ai-code-review','ai-code-review-form','ai-code-review-input','ai-code-review-consent','ai-code-review-output','ai-accessibility-rewriter','ai-accessibility-form','ai-accessibility-mode','ai-accessibility-input','ai-accessibility-output','ai-audience-personalizer','ai-audience-select','ai-audience-apply','ai-audience-output','ai-build-summary','ai-build-release','ai-build-summary-run','ai-build-summary-output','ai-natural-navigator','ai-natural-navigator-form','ai-natural-navigator-input','ai-natural-navigator-output','ai-natural-navigator-help']
for item in required_ids:
    if item not in parser.ids:
        errors.append(f'missing required id: {item}')
if not any('data-form-endpoint' in form for form in parser.forms):
    errors.append('contact form endpoint hook missing')
if 'data-ai-endpoint' not in text:
    errors.append('AI endpoint hook missing')
if 'data-booking-url' not in text:
    errors.append('booking hook missing')
if 'rifat-portfolio-v25.1' not in (ROOT / 'sw.js').read_text(encoding='utf-8'):
    errors.append('service-worker cache version mismatch')
if not (ROOT / 'feed.xml').exists():
    errors.append('RSS feed missing')
print(f'ids={len(parser.ids)}')
print(f'images={len(parser.images)}')
print(f'forms={len(parser.forms)}')
print(f'required_features={len(required_ids)}')
if errors:
    print('errors=')
    for error in errors:
        print(error)
    raise SystemExit(1)
print('html_structure=OK')
print('local_images=OK')
print('image_alt=OK')
print('required_features=OK')
print('hooks=OK')
print('service_worker=OK')
