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
required_ids = ['contact-form','ai-assistant','feedback','outcomes','availability','case-studies','now-building','notes-search','fit-quiz-form','brief-form','client-portal','analytics-console','recruiter-summary','onboarding','demo-lab','demo-sandbox-form','demo-sandbox-output','demo-reel','demo-reel-play','code-playground','code-playground-editor','code-playground-run','accessibility-audit','run-accessibility-audit','brief-print','reading-mode-toggle','proof-ledger','decision-replay','decision-replay-project','scenario-builder','scenario-form','scenario-output','readiness-meter','readiness-form','engineering-principles','changelog-diff','changelog-from','changelog-to','api-docs','copy-api-example','feedback-consent','feedback-consent-form','profile-export','profile-json-export','keyboard-guide','keyboard-guide-toggle','pwa-install-guide','pwa-install-button','reading-mode','architecture-export','performance-budget','run-performance-scan','privacy-center','privacy-clear-state','anti-fit','outcome-planner','outcome-planner-form','outcome-planner-copy-button','download-vcard','toggle-contact-qr','contact-qr-panel','contact-qr','download-contact-qr','security-posture','security-posture-output','failure-simulator','failure-simulator-form','failure-simulator-output','recruiter-snapshot','print-recruiter-snapshot','download-recruiter-snapshot','deployment-readiness','run-deployment-checks','deployment-readiness-results','accessibility-preferences','preference-reduced-motion','preference-high-contrast','preference-large-text','preference-focus-mode','reset-accessibility-preferences','integration-settings','integration-settings-form','integration-contact-endpoint','integration-demo-endpoint','integration-analytics-endpoint','integration-status-endpoint','integration-newsletter-endpoint','integration-settings-reset','project-proof-lab','proof-lab-project','proof-lab-run','proof-lab-state','proof-lab-output','repository-detail','repository-project','repository-detail-output','portfolio-tour','portfolio-tour-start','portfolio-tour-card','portfolio-tour-close','portfolio-tour-prev','portfolio-tour-next','resume-route','brief-pdf','brief-pdf-download','brief-pdf-state','comparison-share-panel','comparison-share-copy','content-release-feed','content-release-feed-load','content-release-feed-list','status-integration','status-integration-refresh','status-integration-output','integration-ai-endpoint','ai-studio','ai-studio-title','ai-grounded-qa','ai-grounded-form','ai-grounded-question','ai-grounded-consent','ai-grounded-output','ai-grounded-answer','ai-grounded-sources','ai-grounded-open','ai-brief-analyzer','ai-brief-analyzer-form','ai-brief-analyzer-input','ai-brief-analyzer-consent','ai-brief-analyzer-output','ai-fit-interpreter','ai-fit-interpreter-run','ai-fit-interpreter-output','ai-architecture-explainer','ai-architecture-output','ai-case-study-qa','ai-case-study-form','ai-case-study-project','ai-case-study-question','ai-case-study-output','ai-code-review','ai-code-review-form','ai-code-review-input','ai-code-review-consent','ai-code-review-output','ai-accessibility-rewriter','ai-accessibility-form','ai-accessibility-mode','ai-accessibility-input','ai-accessibility-output','ai-audience-personalizer','ai-audience-select','ai-audience-apply','ai-audience-output','ai-build-summary','ai-build-release','ai-build-summary-run','ai-build-summary-output','ai-natural-navigator','ai-natural-navigator-form','ai-natural-navigator-input','ai-natural-navigator-output','ai-natural-navigator-help','feature-command-center','visitor-intent-form','visitor-intent-apply','visitor-intent-output','evidence-project','evidence-room-output','evidence-export','decision-log','deployment-health-panel','deployment-health-refresh','deployment-health-output','privacy-ai-transparency','content-freshness-v27','evidence-pack-copy','evidence-pack-status','professional-delivery','collaboration-charter','contact-preflight','contact-preflight-form','contact-preflight-run','contact-preflight-output','risk-matrix','risk-project','risk-matrix-output','threat-model-viewer','threat-model-output','workflow-simulator','workflow-simulator-output','claim-proof-ledger','claim-proof-output','handoff-preview','handoff-copy','handoff-output','design-system-explorer','design-tone','design-scale','design-preview','release-verification','release-verification-check','release-verification-output','shareable-project-routes','share-route-copy','share-route-output','proof-lab-next','evidence-confidence-board','architecture-trace','architecture-trace-output','live-demo-sandbox','live-demo-sandbox-form','sandbox-query','live-demo-sandbox-output','performance-budget-panel','run-v29-performance','performance-budget-output','security-disclosure','maintenance-preview','personalized-proposal-generator','proposal-generator-form','proposal-type','proposal-platform','proposal-generator-output','proposal-copy','release-diff-viewer','release-diff-from','release-diff-to','release-diff-output','proof-rail','proof-rail-output','stack-rationale','stack-rationale-select','stack-rationale-output','case-study-citation-anchors','guided-evaluation','guided-evaluation-title','guided-portfolio-tour','tour-role','tour-start','tour-output','tour-prev','tour-next','tour-step-label','technical-interview-mode','interview-topic','interview-reveal','interview-output','request-response-playground','request-response-form','playground-operation','playground-input','request-response-output','compatibility-matrix','compatibility-copy','compatibility-output','proof-lineage-viewer','proof-lineage-output','acceptance-criteria-builder','acceptance-criteria-form','acceptance-goal','acceptance-criteria-output','acceptance-copy','release-fingerprint-panel','release-fingerprint-run','release-fingerprint-output','assistant-conversation-export','assistant-export-run','assistant-export-output','saved-project-shortlist','shortlist-output','shortlist-copy','deployment-environment-matrix','deployment-environment','deployment-environment-output','build-decision-timeline','decision-timeline-output','screen-reader-reading-order','screenreader-preview-run','screenreader-preview-output','evaluation-ops','evaluation-ops-title','project-comparison-board','compare-projects-run','project-comparison-output','self-health-scanner','self-health-scan-run','self-health-scan-output','real-performance-observer','performance-observer-run','performance-observer-output','seo-social-preview-studio','seo-preview-locale','seo-preview-title','seo-preview-description','seo-social-preview-output','seo-preview-copy','seo-preview-status','interview-rubric-mode','rubric-topic','interview-rubric-output','client-discovery-meeting-builder','discovery-meeting-form','discovery-type','discovery-constraint','discovery-meeting-output','since-last-visit-panel','since-last-visit-output','since-last-visit-mark','public-roadmap','roadmap-items','asset-health-panel','asset-health-run','asset-health-output','private-inquiry-draft-vault','inquiry-draft-input','inquiry-draft-save','inquiry-draft-clear','inquiry-draft-output','case-study-branching-replay','case-study-branch-output','accessibility-scenario-simulator','accessibility-scenario-output','mobile-quick-start','mobile-quick-start-title','mobile-advanced-guide','network-fallback-status','client-ready-layer','client-ready-title','scope-deliverable-map','scope-map-form','scope-map-type','scope-map-output','content-version-switcher','content-mode-output','case-study-annotations','annotation-output','engineering-tradeoff-playground','tradeoff-output','client-portal-preview','portal-output','availability-calendar','portfolio-search-engine','portfolio-search-form','portfolio-search-input','portfolio-search-output','maintenance-incident-replay','incident-output','verified-contact-card','contact-card-export','contact-card-output','content-quality-dashboard','quality-dashboard-run','quality-dashboard-output','project-dependency-graph','dependency-output','personal-brand-kit','brand-kit-output','brand-kit-copy']
for item in required_ids:
    if item not in parser.ids:
        errors.append(f'missing required id: {item}')
if not any('data-form-endpoint' in form for form in parser.forms):
    errors.append('contact form endpoint hook missing')
if 'data-ai-endpoint' not in text:
    errors.append('AI endpoint hook missing')
if 'data-booking-url' not in text:
    errors.append('booking hook missing')
if 'rifat-portfolio-v34.4' not in (ROOT / 'sw.js').read_text(encoding='utf-8'):
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
