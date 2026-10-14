---
target: Vehicle catalog page (VehicleCatalogPage.tsx + VehicleCard + VehicleFilters)
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:D:\\rentx\\frontend\\src\\pages\\VehicleCatalogPage.tsx"
target_fingerprint: "sha256:1a5815cb76e8a78351a55bbb34b21585c74e5ef4e299b3f5b139b8c45e7d5d12"
target_path: "D:\\rentx\\frontend\\src\\pages\\VehicleCatalogPage.tsx"
timestamp: 2026-09-14T03-12-39Z
slug: src-pages-vehiclecatalogpage-tsx
---
# Critique: Vehicle catalog page (`src/pages/VehicleCatalogPage.tsx`)

**Method: ⚠️ DEGRADED: single-context (no sub-agent tool exposed). Browser visualization skipped (no browser automation tool available).**

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Filter changes flash the whole grid back to 6 skeletons; no result count, no "applying filters" cue |
| 2 | Match System / Real World | 2 | `Tarifa mín./máx.` without unit; raw backend strings exposed as options (`automatica` vs `automatico` both listed) |
| 3 | User Control and Freedom | 3 | Good: `Limpiar filtros` + `Todas las X` escape items in every select |
| 4 | Consistency and Standards | 2 | shadcn layer is consistent, but leftover Vite-template CSS in `index.css` fights it (see P1-1) |
| 5 | Error Prevention | 2 | `min=0` on inputs, but `tarifa_min > tarifa_max` produces a silent, confusing empty state |
| 6 | Recognition Rather Than Recall | 3 | Everything visible; select placeholders labeled; nothing icon-only |
| 7 | Flexibility and Efficiency of Use | 1 | No search box, no keyboard path, filters are 5 separate fiddly controls |
| 8 | Aesthetic and Minimalist Design | 2 | Warm tokens are nice, but scaffold CSS centers text/constrains width; cards omit key specs so browsing means clicking through every detail page |
| 9 | Error Recovery | 1 | Raw `error.message` (likely English tech text), no retry button, marcas/categorías failures silently swallowed |
| 10 | Help and Documentation | 0 | No help anywhere on the surface |
| **Total** | | **18/40** | **Poor — solid foundation, weak floor.** |

## Design Specificity Verdict

**LLM assessment — Low/Medium.** The palette is deliberate (warm graphite + burnt-amber accent, Plus Jakarta Sans, es-HN currency formatting — genuinely nice details), but the composition is a generic shadcn catalog grid that any unrelated rental/listing product could ship unchanged. There is almost no product character: the amber accent appears only on the estado badge and CTA, images are whatever the API returns (or a generic car icon), and the estado badge communicates a binary already implied by "Ver detalle". Biggest missed opportunity: a rental-decision card should answer "can I afford it for my dates" at a glance; today it shows name/year/price and nothing about transmisión, combustible, or capacidad — so Jordan opens four detail pages just to compare three cars.

**Deterministic scan — clean `[]`.** The detector (run over `VehicleCatalogPage.tsx` + vehicle components) found nothing. It did not catch issues living outside the scanned surface: the global `index.css` scaffold and the flow-level gaps below. Detector has no false positives to flag; this run's findings are all LLM-side, which is expected given the scan scope.

**Visual overlays — none.** No browser automation tool is exposed, so overlay injection and screenshots did not run. The alignment/centering claims in P1-1 are code-level high-confidence but unconfirmed visually.

## Overall Impression

Competent, careful, and dull. The design tokens and shadcn layer are a proper foundation (better than most demo projects), and the page handles loading and empty states explicitly. But the catalog is the product's front door and it currently behaves like an unstyled CMS grid: the leftover Vite-template CSS in `index.css` is silently degrading the layout it was supposed to replace, and the card doesn't carry the information anyone picking a rental car actually needs. The single biggest opportunity: make this surface answer "which car for my money, my dates" without leaving the grid.

## What's Working

- **Honest state handling**: skeletons mirror the real card geometry, empty state is clear Spanish, and there's an explicit error branch — rare discipline in a demo.
- **Real local correctness**: `Intl.NumberFormat('es-HN', HNL)` with `tabular-nums` is the exactly-right way to show "L 1,500 / día" — and it's consistent with the product contract.
- **Good escape hatches**: `Limpiar filtros` plus a "Todas las X" item in every select means no one gets trapped in a filter state.

## Priority Issues

**P1-1 — Leftover Vite-template CSS pollutes the designed surface (`src/index.css`)**
- **What**: `#root` sets `width:1126px`, `text-align:center`, `border-inline`, base `h1{font-size:56px}`, plus `.counter`/`#social`/`code` template styles. `text-align` is inherited, so the catalog `h1` and card text (name, year, price) inherit centered alignment while the grid/filters render left — an inconsistent, undeclared visual layer the design tokens were meant to replace.
- **Why it matters**: Every surface inherits leftovers that contradict the `@theme` design system; centered card text against left-aligned controls reads as broken craft and betrays the "ámbar/naranja + grafito cálido" direction.
- **Fix**: Confine base typography and page chrome to the design system, delete the template remnants (`#root` centering/width, `.counter`, `#social`, base `h1` at 56px), and get a screenshot to confirm.
- **Suggested command**: `/impeccable layout` (then `/impeccable document` to pin the real system).

**P1-2 — The error path is hostile**
- **What**: `vehiclesQuery.error?.message` prints the raw error string; there is no retry action; and failures from `useMarcas`/`useCategorias` are never surfaced at all — their selects just render virtually empty.
- **Why it matters**: Jordan sees English tech text and no way forward; Riley watches the filters silently drop options and knows something is broken with no signal. Hidden failure is a trust-killer in a product whose entire contract is "server is the source of truth."
- **Fix**: Surfaced, Spanish, actionable error states with retry; treat marcas/categorías failures as first-class since the filter row is useless without them.
- **Suggested command**: `/impeccable harden` (then `/impeccable clarify` for copy).

**P1-3 — No feedback that filtering is happening, or how many results exist**
- **What**: TanStack's query-key switch re-mounts the grid to 6 skeletons on every select change even when data was cached; no result count ("12 carros"); cleared filters look identical to an applied subset until you read the selects.
- **Why it matters**: Alex can't tell whether a filter took; the disappearing grid reads as a page reload; nothing reassures that narrowing "worked" — classic "am I sure it's right" anxiety on a decision surface.
- **Fix**: Keep the prior data visible during refetch (or show a subtle loading bar), add a result count, and optionally active-filter chips.
- **Suggested command**: `/impeccable layout` / `/impeccable clarify`.

**P2-1 — The card under-sells the rental decision**
- **What**: Cards show name, year, price, estado — but no marca, transmisión, combustible, or capacidad. Comparing three cars requires three round-trips to `/carros/:id`.
- **Why it matters**: This is the entire browsing loop; forcing detail-page visits for basic specs doubles the effort and kills the "browse → shortlist" moment.
- **Fix**: Add the 2–3 specs that decide a rental (transmisión, combustible, capacidad) as a muted spec line; consider whole-card link with the button reserved for emphasis.
- **Suggested command**: `/impeccable layout`.

**P2-2 — Filter taxonomy and validation gaps**
- **What**: `automatica` and `automatico` both surface as transmission options (data depend on the backend, but the fallback `DEFAULT_TRANSMISIONES` hardcodes the typo pair); transmisión options are derived from the *currently filtered* result set, so options collapse depending on other filters; no guard against `tarifa_min > tarifa_max` → a blank "No se encontraron carros" with zero explanation.
- **Why it matters**: Jordan sees near-duplicate options and has no idea why options changed after picking a category; Riley gets a mystifying empty state from a self-contradictory range.
- **Fix**: Normalize transmission display labels, decouple option lists from the filtered data (use catalog/fleet), validate + show inline error for inverted ranges.
- **Suggested command**: `/impeccable clarify` + `/impeccable harden`.

## Persona Red Flags

**Jordan (first-timer)** — "Tarifa mín." carries no unit, so Lempiras/day is an inference. The two `automatica`/`automatico` options read as different transmission types. If the API is down, Jordan reads a raw engine message (`error.message`) with no next step. Empty state says "no cars with these filters" but offers no clear action; the "Limpiar filtros" ghost button is 200px above the fold at the top of the filter card.

**Riley (stress tester)** — Sets `mín` lower than `máx`... and returns shouts at a generic empty state; enters `tarifa_max: 0`; notes that marcas/categorías endpoints failing produce silent empty dropdowns with only the vehicles error (if any) shown; refreshes mid-scroll and loses the whole filter state (filters live only in `useState`; no URL sync — also a shareability/back-button gap).

**Casey (mobile)** — Filtering means five stacked taps (3 selects + 2 number inputs, each opening its own control) above a full-width "Ver detalle" per card; no state persistence means an interruption (text, call, app switch) wipes the chosen filters; the number inputs are finger-hostile compared to sliders/chips.

## Minor Observations

- `VehicleCard`'s CTA is the generic "Ver detalle"; the estado badge could instead read as availability-oriented copy ("Disponible hoy").
- No card hover affordance (no lift/shadow/zoom) — the grid reads as static posters.
- No result count or pagination; a 50-car fleet renders 50 full images eagerly (no `loading="lazy"`).
- `Transmisiones` derive from filtered data but `DEFAULT_TRANSMISIONES` (3 items) is the fallback — two conflicting sources of truth for the same control.
- The error path on `VehicleCatalogPage` covers vehicles only; page has no way to retry individual queries.
- `#root` chrome (`border-inline`, centered) plus Tailwind `max-w-6xl` give the page two competing width systems (1126px vs 1152px).

## Questions to Consider

- What is the *actual* decision a renter makes on this grid — price, brand, or availability — and does the card lead with that?
- If filters belong in the URL, how much of the empty-state/memory pain disappears for free?
- What would the catalog look like if the amber accent carried the product's personality instead of appearing on exactly two controls?
