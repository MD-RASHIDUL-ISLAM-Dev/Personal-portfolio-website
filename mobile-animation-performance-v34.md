# Mobile Animation & Performance Report

## পরীক্ষার পরিধি

নতুন editorial motion layer-টি 360×844 এবং 390×844 mobile viewport-এ পরীক্ষা করা হয়েছে। Test run-এ page-top hero entrance, section-word watermark, scroll reveal, project-card reveal, sticky contact CTA, Bengali content, dark theme এবং full-page traversal অন্তর্ভুক্ত ছিল। Browser cache fresh reload করা হয়েছে এবং screenshot capture-এর আগে browser scroll restoration manual করে page top নিশ্চিত করা হয়েছে।

## মোবাইলে animation কীভাবে কাজ করছে

Page load-এর পরে hero eyebrow, oversized Bengali/English headline, supporting copy এবং status rail staggered entrance নেয়। Hero portrait ও aura mobile/coarse pointer-এ stable থাকে; অর্থাৎ mobile-এ unsafe cursor-following 3D transform প্রয়োগ হয় না। Scroll করলে section watermark ধীরে drift করে এবং card/heading viewport-এ আসার সময় opacity ও clip reveal হয়। Existing constellation background low-intensity অবস্থায় থাকে, যাতে content hierarchy নষ্ট না হয়।

উপরের 360px screenshot-এ hero title, compact header/menu, status rail ও constellation দেখা যায়। Projects/proof screenshot-এ scroll reveal-এর পরে card border, heading, body copy এবং bottom sticky CTA readable থাকে। 390px screenshot-এ wider phone width-এ একই hierarchy আরও বেশি breathing room সহ দেখা যায়।

| Runtime signal | 360px | 390px |
|---|---:|---:|
| Viewport | 360×844 | 390×844 |
| Theme / language | Dark / Bengali | Dark / Bengali |
| Motion ready | Yes | Yes |
| Hero entrance complete at capture | Yes | Yes |
| Motion-reduced flag | No | No |
| Section watermarks registered | 10 | 10 |
| Motion cards registered | 34 | 34 |
| Initial horizontal scroll width | 360px | 390px |
| Horizontal overflow | 0px | 0px |

## Scroll reveal coverage

প্রতিটি viewport-এ সাতটি representative section offset-এ deterministic scroll করা হয়েছে। Top অবস্থায় card hidden রাখা lazy reveal-এর প্রত্যাশিত আচরণ; section viewport-এ এলে card visible হয়।

| Viewport | Full traversal measurement | Final scroll width | সর্বোচ্চ sampled visible cards |
|---|---:|---:|---:|
| 360px | 1,128 ms | 360px | 5 |
| 390px | 1,135 ms | 390px | 4 |

এখানে measurement time কেবল scripted section traversal-এর সময়; এটি real-world user scroll speed বা per-frame FPS নয়। গুরুত্বপূর্ণ ফল হলো, section পরিবর্তনের সময় cards reveal হয়েছে এবং কোনো horizontal overflow তৈরি হয়নি।

## Browser performance metrics

`Performance.getMetrics` দিয়ে browser-session cumulative values সংগ্রহ করা হয়েছে। 360px run-এ full scripted traversal শেষে cumulative task time ছিল প্রায় **2.02 seconds**, script execution প্রায় **158 ms**, layout প্রায় **457 ms** এবং style recalculation প্রায় **198 ms**। 390px run-এ cumulative task time ছিল প্রায় **1.98 seconds**, script execution প্রায় **162 ms**, layout প্রায় **328 ms** এবং style recalculation প্রায় **199 ms**।

| Metric | 360px | 390px |
|---|---:|---:|
| Cumulative task duration after traversal | 2.016 s | 1.979 s |
| Cumulative script duration after traversal | 158 ms | 162 ms |
| Cumulative layout duration after traversal | 457 ms | 328 ms |
| Cumulative style recalculation duration | 198 ms | 199 ms |
| JS heap at end of run | 11.80 MB | 10.66 MB |
| Final layout count | 285 | 216 |
| Final style recalculation count | 302 | 327 |

এই metrics পুরো existing feature-rich portfolio shell-এর জন্য cumulative browser values—শুধু নতুন animation-এর isolated cost নয়। তাই এগুলোকে lab FPS বা Lighthouse score হিসেবে ব্যাখ্যা করা উচিত নয়। তবে বর্তমান motion layer কোনো নতুন dependency যোগ করেনি; scroll listener passive এবং rAF-throttled, section reveal IntersectionObserver ও viewport fallback ব্যবহার করে, এবং mobile-এ pointer-heavy effects বন্ধ থাকে।

## Accessibility ও fallback behavior

`prefers-reduced-motion`, Save-Data এবং Simplified View সক্রিয় হলে non-essential motion বন্ধ হয় এবং content opacity 1 অবস্থায় সরাসরি visible থাকে। Reduced-motion QA-তে 360px ও 390px উভয় width-এ সব project card সঙ্গে সঙ্গে visible হয়েছে, এবং overflow শূন্য ছিল। Existing keyboard focus ring, Bengali localization, dark/light theme এবং mobile navigation অপরিবর্তিত রয়েছে।

## সিদ্ধান্ত

মোবাইল ডিভাইসে নতুন animation-গুলো **functional এবং contained**: hero entrance কাজ করছে, scroll reveal section অনুযায়ী activate হচ্ছে, background motion subtle থাকছে, এবং 360px/390px-এ horizontal overflow নেই। Performance profile-এ নতুন animation layer-এর জন্য কোনো obvious blocking failure ধরা পড়েনি। সবচেয়ে গুরুত্বপূর্ণ mobile safeguard হলো—fine-pointer ছাড়া portrait parallax ও custom cursor বন্ধ থাকে, আর reduced-motion ব্যবহারকারীর জন্য সব decorative movement সরিয়ে content immediately readable রাখা হয়।
