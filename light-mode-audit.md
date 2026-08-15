# Light-mode readability audit

Date: 2026-08-15

The preview was opened in Bengali and toggled to light mode at the public preview URL.

Observed from the rendered viewport:

- The overall light background is now visible, but many navigation labels, eyebrow/caps labels, metadata rows, utility controls, status/helper text, and feature-panel readouts remain visually too small.
- The main body copy is readable in the first viewport, but the information hierarchy is inconsistent: some important text is set around .5–.75rem while less important labels use similar or stronger visual weight.
- The current v21 guard explicitly improves nav/contact colors but does not establish a global minimum size or expanded coverage for the many v15–v22 feature surfaces.
- The v22 light override intentionally keeps security/failure/deployment output panels dark with pale text. These panels need to be checked for readability separately and should receive larger line-height and type where they contain important explanatory copy.
- Mobile navigation uses very small brand text (around .66–.72rem for the name and .47rem for the subtitle), which may be hard to read even though the menu structure is correct.

Next: use computed-style inspection across representative elements and apply a final late-cascade accessibility/readability layer rather than changing the visual identity or markup.

## Computed-style evidence

The light baseline is active at `data-theme=light`, `data-language=bn`, `data-view=full`; no large-text preference is active and the body base size is 16px.

Representative computed values from the rendered page include: navigation links 11.68px, brand subtitle 8.32px, `.caps` 9.76px, hero signal label 8.64px, rail metadata 10.72px, project metadata 9.6px, form labels 10.24px, `.small-note` 9.92px, terminal hint 8.96px, and analytics note 8.64px. These sizes are too small for important explanatory or navigational text, particularly in Bengali. Body and hero paragraphs are larger, but the page lacks a consistent readable minimum for supporting text.

The current v22 trust selectors were absent in the first viewport because those sections are below the fold; they must still be covered by a late-cascade rule and checked after scrolling.

The issue is primarily typography scale and incomplete selector coverage, not only one failed color token. A final readability layer should raise critical support text to approximately 12–14px on desktop and 13–15px on mobile, increase line-height, strengthen light-mode muted colors, and enlarge high-value labels without changing the editorial display headings.

## Cache note

After the first CSS patch, the public preview still returned the old computed values for several selectors protected by the v21 rules. The page is being served behind the existing v22 service-worker cache, so a cache-busted QA pass and a service-worker cache version bump are required before judging the patch. The new selector did appear on some newly added elements, but the main nav/brand and legacy feature selectors still reflected old values, confirming stale cached CSS rather than a failed design decision.

## v23 fresh computed result

After adding `style.css?v=23`, bumping the service worker and reloading the preview, the new layer is active. At 1280px Bengali light mode, computed values now include: nav links 13.44px, caps 12.48px, hero fine print 12.8px, hero/body paragraphs 16px with 30.4px line-height, form labels 12.48px, helper notes 16px with 30.4px line-height, preference descriptions 12.8px with 24.32px line-height, and recruiter snapshot copy 16px with 30.4px line-height. The light colors are explicit dark slate/gold values rather than inherited pale dark-theme tokens.

The project metadata sample selected by the query was a `.caps`-style metadata element, so it remained governed by its specialized 12px-range rule; the actual project description selector is covered by the 16px body-copy rule.

## Remaining specificity issue

The v23.1 fresh audit confirms most interaction labels now render at approximately 13.44px. However, `.project-card .caps` still computes to 8.8px because the legacy compound selector has higher specificity than the broad `:where()` rule. The same specificity risk applies to `.project-card p:not(.caps)`, `.project-card__topline .caps`, and other compound feature selectors. A final explicit light-theme rule for these compounds is required before packaging.

## v23.2 final audit checkpoint

Fresh desktop light mode confirms project descriptions at 16px/28.8px, service copy at 16px/28.8px, project metadata and statuses at 12.48px/18.1px, security layer controls at 13.44px/19.5px, and note tags at 13.44px/19.5px with readable slate/gold colors. One skill proof sample still computes at 9.28px; it is likely generated via a pseudo-element or a different structural selector rather than the paragraph rule, so its actual markup path is being inspected before the final patch.

## Skill proof cascade diagnosis

The remaining small values are caused by the original `.skill-used-in` rule using `font: ... !important` and the original confidence selector having higher specificity. The final light rule must use matching `!important` declarations for `.skill-used-in` and explicit specificity for `.skill-card .skill-card__heading .skill-confidence`; the technology tags are already at 12.48px and are acceptable.

## Final v23.5 browser QA

Fresh client checks passed in English light mode at 1280px: body copy 16px/28.48px, project descriptions 16px/28.8px, skill proof 14.4px/24.48px, confidence labels 12.48px/18.1px, project metadata 12.48px/18.1px, security controls 13.44px/19.5px, and accessibility descriptions 12.8px/19.2px with explicit dark-slate or gold colors.

Fresh client checks passed in English dark mode without changing the dark editorial palette: body copy remains readable, project descriptions remain 13.76px/24.08px, skill proof is raised to 12.48px/19.34px, confidence labels to 10.4px/14.04px, and project metadata to 11.52px/16.13px. Bengali light-mode QA was completed earlier with the same light color system and reduced tracking. The large-text preference was applied and reset successfully; it raised navigation and form labels to 16px and kept the main support surfaces at or above readable line-height.

## 390px mobile QA

A fresh CDP viewport at 390×844 passed the responsive regression check. Before opening, the menu was closed, body scroll was unlocked, and `aria-expanded=false`. After opening, the menu had `is-open`, body scroll lock was active, `aria-expanded=true`, and all 5 mobile utility controls were inside `#site-nav-mobile-tools`. Closing restored all three states.

At the same 390px light Bengali viewport, nav links computed to 15.04px/24.06px, hero and body copy to 16.32px/31.01px, form labels to 13.44px/25.54px, security controls to 14.4px/20.88px, and accessibility descriptions to 12.8px/24.32px. This confirms the new mobile readability layer is active without breaking the existing header behavior.
