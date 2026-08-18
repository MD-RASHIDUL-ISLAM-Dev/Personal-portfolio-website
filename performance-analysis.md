# Rifat Portfolio v19 — Performance and Size Analysis

## Measurement scope

This report measures the deployable v19 archive against the available v17 archive, the core HTML/CSS/JavaScript payloads, local asset weights, and browser Resource Timing from the local preview. Values are observed measurements, not Lighthouse or field-user scores.

## Baseline package results

| Metric | v17 | v19 | Change |
|---|---:|---:|---:|
| ZIP size | 15,258,103 bytes | 15,275,150 bytes | +17,047 bytes (+0.1117%) |
| ZIP entry count | 40 | 40 | No change |
| Uncompressed archive content | 17,544,282 bytes | 17,617,450 bytes | +73,168 bytes (+0.4170%) |
| Core code raw size (HTML + CSS + JS + SW) | 446,400 bytes | 514,959 bytes | +68,559 bytes (+15.3581%) |
| Core code gzip sum | 106,545 bytes | 122,047 bytes | +15,502 bytes (+14.5497%) |

The overall ZIP changed very little because the portfolio is dominated by existing visual assets. The new features materially increased code size, especially JavaScript and HTML, while adding almost no new media weight.

## Core code deltas

| File | v17 raw | v19 raw | Raw change | v17 gzip | v19 gzip | Gzip change |
|---|---:|---:|---:|---:|---:|---:|
| `index.html` | 113,696 | 136,833 | +20.35% | 28,162 | 33,058 | +17.39% |
| `style.css` | 140,157 | 148,622 | +6.04% | 26,431 | 27,617 | +4.49% |
| `script.js` | 191,183 | 228,140 | +19.33% | 51,352 | 60,766 | +18.33% |
| `sw.js` | 1,364 | 1,364 | 0% | 600 | 606 | +1.00% |

## Initial first-party browser load

The observed local browser run requested seven first-party resources during the initial page load. Their decoded sizes summed to approximately **11.004 MiB**. The largest resources were the 6.05 MB `favicon.svg`, the 4.54 MB header PNG, the 0.31 MB MRI project WebP, the 0.27 MB portrait JPEG, the 0.23 MB JavaScript file, and the 0.15 MB stylesheet. The Resource Timing snapshot reported zero `transferSize` for those resource entries because the local preview was served through a cache/proxy path; therefore decoded bytes are the reliable comparison in this snapshot, not a real network transfer measurement.

## Initial observations

The new feature layer increases parsing and execution work in the HTML and JavaScript, but the dominant first-load cost is still media. The largest single asset is the 6.05 MB favicon SVG, which is unusually large for a favicon and is a higher-impact optimization target than the newly added feature code. The 4.54 MB header PNG is the second-largest asset. The feature code is comparatively compressible: v19 HTML, CSS, JavaScript and service worker together are 514,959 raw bytes and approximately 122,047 bytes as a simple gzip sum.

## Cold-load timing snapshot

After clearing the local service-worker cache, the local cold navigation reported approximately **170 ms to DOMContentLoaded** and **233 ms to loadEventEnd** in this environment. The first-party Resource Timing entries showed about **6,196,111 decoded bytes** in the cold snapshot, because several image entries were reported with `decodedBodySize=0` and small proxy `transferSize` values while the favicon remained fully reported. This demonstrates that the local proxy/cache path does not expose a reliable real-world transfer metric; the file-size inventory remains the authoritative payload comparison.

## Runtime complexity snapshot

The v19 DOM contained **2,286 elements, 52 sections, 113 buttons, 10 forms, 6 images and 2 Canvas layers**. Three images were marked lazy-load. The available Resource Timing snapshot showed three Google Fonts resources and five GitHub public API fetch attempts; no third-party analytics or arbitrary code execution resource was observed. The browser reported no Long Task entries in this snapshot.

A one-second `requestAnimationFrame` counter observed 45 frames in full view and 46 frames in simplified view in the sandbox. This counter measures the browser's animation opportunity, not portfolio CPU time, so it should not be interpreted as a benchmark. The simplified view nevertheless remains important because it disables non-essential Canvas/aura effects through the existing state rules.

## Feature-surface growth

| Structural measure | v17 | v19 | Change |
|---|---:|---:|---:|
| Unique HTML IDs | 259 | 330 | +27.41% |
| Forms | 7 | 10 | +42.85% |
| Buttons | 82 | 102 | +24.39% |
| Sections | 40 | 52 | +30.00% |

This confirms that the feature additions increased interaction surface substantially, even though the archive size barely changed. The primary maintainability cost is therefore JavaScript/HTML complexity rather than media transfer.

## Performance interpretation

The current state is best described as **feature-rich but asset-heavy**, not code-heavy. The v19 core code is only about 2.92% of the uncompressed archive, while the image and SVG assets account for approximately 95.91%. The favicon alone accounts for about 34.32% of the archive, the header logo PNG about 25.74%, and those two files together about 60.06%.

The new feature code does add parsing, event-listener registration, DOM queries, localStorage work, and two Canvas animation layers. In the observed browser run, however, no Long Task entry appeared and the measured cold local navigation reached DOMContentLoaded in about 170 ms. These are useful regression signals, not field performance guarantees; the local proxy and browser cache do not represent a mobile 3G/4G network or a low-end device.

## Recommended optimization order

1. **Optimize the favicon delivery path.** The 6.05 MB `favicon.svg` should be reduced to a genuinely small vector or replaced as the default browser icon with a tiny 32×32 or 64×64 PNG/ICO while retaining the current source artwork separately if exact visual preservation matters. This is the single largest likely first-load opportunity.
2. **Create a right-sized header logo.** The 4.54 MB, 1920×1920 `header-mr-logo.png` is rendered as a small navigation mark. A visually equivalent 128×128 or 256×256 optimized asset would materially reduce the initial image payload without changing the visible design.
3. **Use the existing small share banner by default.** The package contains both a large 4.40 MB social-share PNG and a 185 KB JPG. Social metadata should prefer the smaller delivery-ready image; the large PNG can remain an editable source only if it is still needed.
4. **Keep below-fold artwork lazy.** Three images are already marked lazy. Preserve that behavior for project artwork and avoid preloading images that are not visible in the first viewport.
5. **Verify host compression.** Serve HTML, CSS, JavaScript, RSS and manifest with Brotli or gzip at the deployment layer. The code compresses well: the core-code gzip sum is approximately 122 KB versus 515 KB raw.
6. **Defer non-critical activity on constrained devices.** GitHub public API snapshots, Canvas animation and secondary interaction setup should remain gated by visibility, reduced-motion and Save-Data signals. The current Simplified View is already a good fallback and should be retained.
7. **Only split JavaScript if the site grows further.** The 228 KB raw / roughly 61 KB gzip `script.js` is not the dominant payload today. Splitting it would improve initial parse cost but would add static loading complexity; it is lower priority than image optimization.

## Bottom line

The recommended features made the codebase meaningfully larger—core code grew by roughly 15.36% raw and 14.55% in the simple gzip comparison—but the complete deployable ZIP grew by only **0.1117%** because no new heavy media was added. The best next performance improvement is therefore not removing the new features. It is reducing the existing oversized favicon and header logo, then verifying real deployment compression and mobile Web Vitals on the chosen hosting provider.
