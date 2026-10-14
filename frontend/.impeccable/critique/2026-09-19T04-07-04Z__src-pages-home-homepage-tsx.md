---
target: Home page (src/pages/home/HomePage.tsx)
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
p2_count: 2
target_identity: "file:D:\\rentx\\frontend\\src\\pages\\home\\HomePage.tsx"
target_fingerprint: "sha256:ae92fdde95bbe3d1e91ace539b595cdad449c36dafc327ba71a5ae4843d25257"
target_path: "D:\\rentx\\frontend\\src\\pages\\home\\HomePage.tsx"
timestamp: 2026-09-19T04-07-04Z
slug: src-pages-home-homepage-tsx
---
# Critique: Home (src/pages/home/HomePage.tsx)

⚠️ DEGRADED: single-context (no sub-agent/Task tool exposed; A and B ran inline, sequentially). No browser automation tool exposed — no live page/overlay; glass contrast and hero-tablet overlap unverified.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Current vehicle labeled, skeletons present; 3D loads into silent blank stage, auto-advance never announced |
| 2 | Match System / Real World | 4 | Colombian Spanish throughout; Recogida/Devolución map to the mental model |
| 3 | User Control and Freedom | 3 | Escape routes clear; carousel auto-advances with only pointer-hover pause |
| 4 | Consistency and Standards | 4 | Tokens and components reused cleanly; single design language |
| 5 | Error Prevention | 3 | Return-date constrained; category cards silently vanish; CTA never guards empty dates |
| 6 | Recognition Rather Than Recall | 3 | Options visible; gestures require subtitle; pips unlabeled visually |
| 7 | Flexibility and Efficiency | 1 | Linear path; no keyboard shortcuts; category shortcuts are the only accelerator |
| 8 | Aesthetic and Minimalist Design | 3 | Warm palette disciplined; two large car moments dilute each other |
| 9 | Error Recovery | 2 | Count band degrades; categories and 3D show nothing on failure |
| 10 | Help and Documentation | 2 | Inline gesture hint good; nothing beyond |
| **Total** | | **28/40** | **Good** |

## Design Specificity Verdict

High specificity. Date-first hero seeds catalog availability, 3D turntable of real fleet models, category tiles navigate with the exact backend filter. Only generic trope: "El viaje empieza aquí" + photo + gradient travel-brand formula, but the mechanism beneath grounds it.

Deterministic scan clean (exit 0, `[]`) across 9 markup files: HomePage/HeroSection/HomeDatePicker/FeaturedVehicles/WhyRentX/PopularCategories/HomeSteps/HomeFooter/Header. Caught nothing inline missed. Cannot measure glass/overlay contrast against photos. No visual overlays (no browser tool).

## Overall Impression

Confident, warm, coherent landing; date→availability thesis is genuinely good. Risks concentrate in the two most ambitious elements: the full-viewport 3D carousel and the layered hero — two "wow" car moments competing.

## Priority Issues

1. [P1] 3D carousel inaccessible and fragile: no aria-live for current model, auto-advance 7s with only hover-pause, 8-16px pip targets, GLB failures show silent blank canvas (Suspense fallback null). Fix: aria-live region, visible pause control, larger pip targets, poster/Skeleton + retry fallback. → /impeccable audit, /impeccable harden
2. [P1] Brand icon breaks dark-surface contrast rule in hero header: logo circle `bg-[var(--accent-bg)] text-primary` teal over near-black film — teal-on-dark the own-world bans; only #8FD9CE is AA-legal on dark. Fix: #8FD9CE icon (or drop tinted circle) in `transparent && !scrolled`. → /impeccable colorize
3. [P1] Hero car auto-rotates every 6s against the brief (which says the carousel was eliminated): setInterval swapping carro1-4.png at HeroSection.tsx:54-60, random initial, ignores reduced-motion. Fix: one random car per visit, delete interval. Also brief's 01/05 counter badge absent — decide truth. → /impeccable distill
4. [P2] Silent empty/error states in PopularCategories (photo-less category renders null, grid shrinks; API error → header + zero cards) and 3D stage (blank on GLB failure). Fix: explicit empty state + error/retry. → /impeccable onboard
5. [P2] Home load budget spent redundantly: WhyRentX fetches all vehicles to count; PopularCategories fires useCategorias + one query per category; 3D stage pulls remote GLBs + drei Environment HDR; hero loads 2 eager remote images. Impacts LCP/3G. Fix: cheaper count source, reuse queries, static/preloaded environment fallback. → /impeccable optimize

## Persona Red Flags

Jordan: composite gesture (swipe vs rotate) invisible/undocumented visually; pips look decorative, no legend.
Riley: random hero car differs per reload (stateful inconsistency); category card silently drops without photo; return-before-pickup cleared with no explanation.
Casey: full-viewport 3D stage on phone is a giant tap/drag playground; 8-16px pips un-tappable; pause is hover-only, phones can't hold hover.

## Minor Observations

- Brief↔code drift: hero parallax car 0→320 (code 0→55); 01/05 counter badge absent.
- Brief audience says Honduras; product/code say Colombia.
- WhyRentX/PopularCategories double-wrapped in motion (Reveal + whileInView).
- Heavy `!important` utility usage in hero (brittle).
- "Ver todos →" only at sm+, mobile twin sits below the stage.
- Hero car/capsule overlap at 640-1024px unverified.

## Questions to Consider

- One chosen car in the hero, 3D stage as the single car showcase?
- Is the vehicle count worth a full-API fetch vs a static catalog CTA?
- Without auto-rotation everywhere, does it feel calmer or emptier?
