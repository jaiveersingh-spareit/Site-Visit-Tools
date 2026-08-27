# Coordinate & Pin System — Hard-Won Knowledge

Scope: pins, coordinates, zoom, pan, and positioning across the Spare-it Site Visit
Form. Compiled from the coordinate/pin/zoom/pan docs in the project root and
`Development/`. Every non-obvious claim cites its source doc. Where two docs
disagree, both are stated and the disagreement is called out — none of it is
silently reconciled.

**Read the "Contradictions" and "Open / unresolved" sections before you touch any
coordinate math.** Several of the formulas below are documented in mutually
incompatible forms and the docs never settle which one shipped.

---

## 1. The model in one page

### Two layers, never one

There are exactly two things a pin position can be, and they must never be
conflated:

| Layer | What it is | Where it lives | When it changes |
|---|---|---|---|
| **Stored** | Position as a percentage of the *original image*, 0–100 (clamped 2–98 in practice) | `S.floors[].stations[].x/.y` (and `gateways[]`, `displays[]`) → localStorage | Only when the user places or repositions a pin |
| **Rendered** | Position in container pixels (or container-percent) | Computed in `renderPins()`, written to `style.left/top` | Every zoom change, every pan, every scroll, every orientation change |

`PIN_COORDINATE_SYSTEM_REDESIGN.md` describes this as three tiers — Image Space
(source of truth, "NEVER CHANGES"), Displayed Space (intermediate, zoom-scaled
pixels), and Screen Space (temporary, "recalculated every frame"). The middle
tier is a calculation step, not a storage location. Treat Displayed Space as
scratch.

The whole architecture exists because of one failure mode, stated in that doc:
the original system converted a tap to image coordinates but **stored the result
in current screen space**, so any subsequent zoom change invalidated every pin.

### Forward direction (render): stored % → pixels

`PIN_COORDINATE_SYSTEM_REDESIGN.md`, pixel form:

```
centerOffsetX = (displayedWidth  - containerWidth ) / 2
centerOffsetY = (displayedHeight - containerHeight) / 2
displayedX    = (pin.x / 100) * displayedWidth
screenX       = displayedX - centerOffsetX - floorPlanPanX
```

`COORDINATE_FORMULA_EXPLANATION.md`, the algebraically-collapsed percent form,
valid only when `displayedWidth == containerWidth * zoom`:

```
renderedPercent = storedPercent * zoom - (zoom - 1) * 50
```

The doc derives this step by step (image pixels → displayed pixels → centering
offset → container percent) and proves four properties: identity at zoom 1.0,
center invariance (50% renders at 50% at every zoom), monotonicity (pin ordering
is preserved), and symmetry (distance from centre scales by exactly `zoom`).
Those four properties are the cheapest correctness check you have — see §5.

### Inverse direction (tap): pixels → stored %

`REPOSITIONING_FIX_SUMMARY.md` (the corrected form):

```
containerX        = clientX - containerRect.left
baseCenterOffsetX = (displayedWidth - containerWidth) / 2      // displayedWidth, NOT imgRect.width
imageScreenX      = containerX + baseCenterOffsetX + floorPlanPanX
imagePixelX       = (imageScreenX / displayedWidth) * img.naturalWidth
storedPercentX    = (imagePixelX / img.naturalWidth) * 100
storedPercentX    = clamp(2, 98, storedPercentX)
```

Note the sign asymmetry against the render path: rendering **subtracts**
`floorPlanPanX`, tapping **adds** it. That is correct — they are inverses. Sign
errors here are the single most common way this subsystem breaks.

### What the caching is for

`CLAUDE.md` (project instructions) documents `baseContainerWidth` /
`baseContainerHeight` as cached at floor load by `updateDisplayDimensions()`, and
calls the separation of these from scroll/pan state **critical** —
"Modifying `baseContainerWidth` during pan causes coordinate feedback loops"
and "prevents image size from inflating due to pan overflow".

The mechanism of the loop: `updateFloorPlanTransform()` as reviewed in
`CODE_REVIEW_FLOOR_PLAN_ZOOM.md` reads `container.offsetWidth` **live on every
call** and then writes `img.style.width = baseWidth * floorPlanZoom`. If the
container's measured width is ever influenced by the image it contains (overflow
from pan, or a re-layout mid-gesture), each call feeds its own output back in and
the image grows without bound. Caching the container dimensions once, at floor
load, breaks the cycle: the multiplier's input becomes a constant for the life of
the floor.

`floorPlanDisplayState` is the cache the redesign doc reads from
(`{ displayedWidth, displayedHeight, containerWidth, containerHeight }`), and it
states the rule twice: *never* recompute display dimensions inside `renderPins()`,
and *always* call `updateDisplayDimensions()` **before** `renderPins()` after a
zoom change, or you render against a stale cache.

### Why the layers must stay separate

`REPOSITIONING_BUG_ANALYSIS.md` names the exact cost of mixing them:
`getBoundingClientRect()` on the `<img>` returns the position **after** the CSS
`translate()` pan has been applied. Deriving the centering offset from that rect
therefore counts the pan twice — once inside the rect, once when you add
`floorPlanPanX`. The fix is to source the centering offset from cached,
pre-transform `displayedWidth`/`displayedHeight` and add the pan explicitly and
exactly once.

---

## 2. Bugs we hit and what actually caused them

Only bugs where the source doc states an actual root cause. Symptom → cause →
fix, with the math where the math is the point.

| Symptom | Root cause | Fix | Source doc |
|---|---|---|---|
| Repositioning a pin at zoom 1.5 with pan lands it at the wrong percentage (tap at visual 50% stored as 45%) | Pan double-counted. `handlePlanTap()` computed `centerOffsetX = (imgRect.width - containerRect.width)/2`, and `imgRect` already includes the CSS `translate()` pan; the pan was then effectively applied a second time | Use cached `floorPlanDisplayState.displayedWidth` (pre-transform) for the centering offset and add `floorPlanPanX` explicitly once: `imageScreenX = containerX + baseCenterOffsetX + floorPlanPanX`. Also divide by `displayedWidth`, not `imgRect.width` | `REPOSITIONING_BUG_ANALYSIS.md`, `REPOSITIONING_FIX_SUMMARY.md` |
| Panning a zoomed plan drags stations off-screen; measured pan of −112px against a computed `maxPanX` of 99.5px | Pan bounds computed as `(containerWidth * (zoom - 1)) / 2`, which assumes the displayed image is `containerWidth * zoom` wide — i.e. assumes a square/container-matched aspect. Real floor plans are not, so the bound was wrong for the actual displayed width. Compounded by the bound not being re-applied on every path | New `enforcePanBounds()` deriving displayed size from the real aspect ratio: `displayedHeight = containerHeight * zoom; displayedWidth = displayedHeight * (img.naturalWidth / img.naturalHeight); overflow = displayed − container; maxPan = abs(overflow)/2`, then clamp. Called from the pan handler, from `setZoomLevel()`, and from `pinchend` | `PAN_BOUNDS_FIX_SUMMARY.md` |
| Pan valid at one zoom becomes invalid after zooming in | Pan was scaled proportionally (`pan *= zoomRatio`) but never re-clamped to the *new* zoom's limits. Scaling alone is not sufficient | `setZoomLevel()` calls `enforcePanBounds()` after scaling the pan | `PAN_BOUNDS_FIX_SUMMARY.md` |
| Visible jump/jank at the end of an aggressive drag | Pan was applied and rendered first, clamped on the *next* event — so a frame rendered out of bounds and the clamp visibly caught up | Clamp inside the same pan event, before render | `PAN_BOUNDS_FIX_SUMMARY.md` |
| Recorded tap test: 0/3 taps placed correctly, 0% accuracy, while 23/23 automated tests passed | Aspect-ratio transposition. Test/dev assumptions used 3024×4032 (3:4 portrait); the actual image was 4032×3024 (4:3 landscape). At zoom 1.75 that changes displayedWidth 514.5px → 696.5px and maxPan 85.75px → 149.25px, so every centering offset and bound was wrong. The doc is explicit: "This is NOT a fundamental algorithm failure — it's an input validation issue" | Doc prescribes verifying the code reads `img.naturalWidth / img.naturalHeight` dynamically everywhere (not just in `enforcePanBounds()`) rather than relying on any assumed ratio. **The doc does not record that this was confirmed or fixed** — see §6 | `TAP_DATA_ANALYSIS.md` |
| "Save Position" appears to do nothing when repositioning; pin moves on screen but reverts | The Save button was rendered *inside* `#placement-instruction`, and `renderFloorDetail()` set `instruction.style.display = state.isInPlacementMode ? 'block' : 'none'`. In edit mode `isInPlacementMode === false`, so the freshly-rendered Save button was hidden. It was never clicked because it was invisible | One line: `display = (state.isInPlacementMode \|\| state.isEditPositionMode) ? 'block' : 'none'` | `PIN_EDIT_UX_FIX.md` |
| Same save failure, second contributing cause | `saveEditPosition()` and `cancelEditPosition()` still called `resetZoomPan()`, a function that no longer exists in the zoom-stripped build — throwing before persistence and failing silently | Remove the `resetZoomPan()` calls from both functions in the no-zoom variant | `PIN_EDIT_ISSUE_ANALYSIS.md` |
| Repositioning a **gateway or display** silently loses the new coordinates; object stays put | `confirmPinLocation()`'s `isRepositioning` branch only ever looked up `gF().stations.find(s => s.id === positioningStationId)`. It ignored `gatewayPositioningMode` / `displayPositioningMode` and returned without writing `gw.x/gw.y` or `d.x/d.y` | Add gateway and display branches that write coordinates and `persist()` before cleanup | `GATEWAY_DISPLAY_POSITIONING_ISSUES.md` (Issue #1) |
| Display pins never appear on the floor plan even when `x`/`y` are set | `renderPins()` iterated `f.stations` and `f.gateways` only — no `f.displays` loop | Add the displays loop emitting `.plan-pin[data-type="display"]` | `GATEWAY_DISPLAY_POSITIONING_ISSUES.md` (Issue #2) |
| Long-press delete of a display pin does nothing, no error | `deletePin(type, id)` branched on `'station'` and `'gateway'` only; a `'display'` type fell through to `persist()` with nothing removed. `renderDisplays()` was also missing from its re-render list | Add the `display` branch and `renderDisplays()` call | `GATEWAY_DISPLAY_POSITIONING_ISSUES.md` (Issue #3) |
| Display detail operations fail on first load | `curDisplayId` was never declared alongside `curFloorId/curStationId/curGatewayId`; first written inside `openDisplay()`. Until then `gDisplay()` returns `undefined` | Declare `curDisplayId = null` with the other context vars | `GATEWAY_DISPLAY_POSITIONING_ISSUES.md` (Issue #4) |
| Clicking "Position" on an existing gateway opened the *new object* type chooser | `handleGatewayPosition()` / `handleStationPosition()` / `handleDisplayPosition()` unconditionally opened `modal-pin-type`, with no distinction between initial placement (type unknown) and repositioning (type already known) | See the contradiction below — this was fixed twice, in two opposite ways | `BUG_FIX_GATEWAY_POSITIONING.md` then `BUG_FIX_POSITIONING_FLOW_CORRECTED.md` |
| After the first fix above: no green tap highlight, and the reposition never persisted | The first fix handled repositioning *inside* `handleGatewayPosition()`, which bypassed `confirmPinLocation()` — the only function that writes coordinates — and dropped the `showTapHighlight()` call on some paths | Revert to one unified path: every handler does `showTapHighlight(); openModal('modal-pin-type')`, and `confirmPinLocation()` branches on `isRepositioning`. All coordinate writes funnel through `confirmPinLocation()` | `BUG_FIX_POSITIONING_FLOW_CORRECTED.md` |
| Newly created gateways/displays ended up unpinned with no prompt, unlike stations | Their success modals (`modal-gateway-added`, `modal-display-added`) offered only a "Continue" button straight to the floor view — there was no "Position Now" path and no prompt modal, so the positioning step simply didn't exist for those types | Added "Later"/"Position Now" to both success modals, added `modal-position-new-gateway` / `modal-position-new-display`, and `startGatewayPositioningForNewGateway()` / `startDisplayPositioningForNewDisplay()` mirroring the station function | `POSITIONING_WORKFLOW_UNIFIED.md`, `STATION_POSITIONING_IMPROVEMENTS.md` |
| Positioning mode left dirty after the user cancels | `exitPinMode()` did not reset `stationPositioningMode` / `positioningStationId` (and gateway equivalents), so cancelling mid-positioning left the flags set | Reset positioning flags inside `exitPinMode()` — flagged as the immediate high-priority recommendation | `CODE_REVIEW_POSITIONING_BUTTONS.md` |
| Tap fires spuriously at the end of a pan or pinch | Hammer.js emits `tap` after gesture sequences | `floorPlanGestureActive` flag; the tap handler runs `handlePlanTap()` only when it is false | `CODE_REVIEW_FLOOR_PLAN_ZOOM.md` |
| Zoom controls appearing/positioned wrongly | The `.zoom-controls` CSS class declares `position:absolute; top:-50px; z-index:50`, while the element's inline styles declare `position:fixed; top:50%; left:50%; z-index:300` | Not a live bug — inline styles win the cascade. But the dead CSS class is a trap for the next reader; the review recommends deleting it | `CODE_REVIEW_FLOOR_PLAN_ZOOM.md`, `ZOOM_MODAL_FLOW_DIAGRAM.md` |
| Green debug circle gave no sense of what was being placed | The placement indicator was a raw green circle, not pin-shaped, and no pin existed until the object was created | Replaced by a real gray `?` placeholder pin (`#pending-pin-placeholder`) using the same `.plan-pin` structure and the same image-space positioning as real pins, so it pans and scrolls with the plan. Cleared by `clearTapHighlight()`, which `createNewGatewayFromPin()` and `createNewDisplayFromPin()` now call explicitly (`confirmStationCreation()` gets it via `exitPinMode()`) | `PENDING_PIN_IMPLEMENTATION.md` |

### Contradiction: how repositioning was fixed

`BUG_FIX_GATEWAY_POSITIONING.md` and `BUG_FIX_POSITIONING_FLOW_CORRECTED.md`
prescribe **opposite** designs for the same three handlers:

- The first says branch on `isRepositioning` *inside* `handleGatewayPosition()`,
  write `gw.x/gw.y` there, and skip `modal-pin-type`.
- The second says that fix "was too complex and broke the modal flow" — it
  bypassed `confirmPinLocation()` so coordinates were never saved — and mandates
  the unified path where every handler shows the highlight and opens
  `modal-pin-type`, with the branch living in `confirmPinLocation()`.

The second doc is later and explicitly supersedes the first, so the unified path
is the intended design. The first doc is left in the repo with no correction
notice on it. **Do not follow `BUG_FIX_GATEWAY_POSITIONING.md`.**

---

## 3. Invariants — do not violate

1. **Store image percentages, never screen or container pixels.**
   `PIN_COORDINATE_SYSTEM_REDESIGN.md`: "❌ WRONG `pin.screenX = 245`" /
   "✅ RIGHT `pin.imagePercentX = 45.5`". Storing screen space is the original
   bug the whole redesign exists to undo.

2. **Never derive a centering offset from `getBoundingClientRect()` on the
   image.** That rect already contains the pan transform; using it double-counts
   the pan (`REPOSITIONING_BUG_ANALYSIS.md`). Use cached
   `floorPlanDisplayState.displayedWidth/Height`.

3. **Add the pan exactly once, with the right sign.** Tap: `+ floorPlanPanX`.
   Render: `− floorPlanPanX`. (`REPOSITIONING_FIX_SUMMARY.md`,
   `PIN_COORDINATE_SYSTEM_REDESIGN.md`.)

4. **`updateDisplayDimensions()` before `renderPins()`, always.** Rendering
   against a stale cache after a zoom change is called out explicitly:
   "❌ WRONG `renderPins(); // Uses old displayedWidth!`"
   (`PIN_COORDINATE_SYSTEM_REDESIGN.md`).

5. **Never mutate `baseContainerWidth` / `baseContainerHeight` during a pan.**
   Causes the coordinate feedback loop / image inflation (`CLAUDE.md`).

6. **Recalculate, never incrementally adjust, a pin's rendered position.**
   "❌ WRONG `pin.style.left = oldScreenX + panDelta`" — always recompute from
   the stored percentage (`PIN_COORDINATE_SYSTEM_REDESIGN.md`).

7. **Every zoom change and every pan change ends with `renderPins()`.**
   `setZoomLevel()` and the pan handler both must call it
   (`PIN_COORDINATE_SYSTEM_REDESIGN.md`).

8. **`enforcePanBounds()` runs on every pan event, after every zoom change, and
   on `pinchend` — and it must use the real `img.naturalWidth /
   img.naturalHeight`.** Missing any one of these paths reintroduces
   out-of-bounds pan (`PAN_BOUNDS_FIX_SUMMARY.md`).

9. **All coordinate writes funnel through `confirmPinLocation()`.** Writing
   `x`/`y` from a positioning handler bypasses persistence and re-render
   (`BUG_FIX_POSITIONING_FLOW_CORRECTED.md`).

10. **Any new pin type must be added in *five* places, not one:** the floor data
    structure, `renderPins()`, `attachPinListeners()`'s consumers, `deletePin()`,
    and the `render*()` list called after mutation — plus a `cur<Type>Id`
    declaration. Displays shipped missing four of these
    (`GATEWAY_DISPLAY_POSITIONING_ISSUES.md`, `CODE_REVIEW_POSITIONING_BUTTONS.md`).

11. **Stored coordinates are clamped to 2–98%.** Anything outside that range in
    storage is corruption, not an edge case
    (`COORDINATE_FORMULA_EXPLANATION.md`, "❌ INVALID"). Drag-to-move enforces the
    same clamp (`Development/PHASE1_PIN_MOVEMENT_TESTS.md`).

12. **`exitPinMode()` must clear every positioning flag** (`stationPositioningMode`,
    `positioningStationId`, and the gateway/display equivalents)
    (`CODE_REVIEW_POSITIONING_BUTTONS.md`).

13. **Show a UI element on the union of the modes that can produce it.** The
    `isInPlacementMode`-only check hid the Save button in edit mode
    (`PIN_EDIT_UX_FIX.md`). Any `mode ? show : hide` check is suspect.

---

## 4. Rendered vs stored: what each zoom state should do

### zoom = 1.0
- `rendered === stored`, within rounding. This is the identity property and the
  primary regression check (`COORDINATE_FORMULA_EXPLANATION.md`).
- All rendered values fall inside 0–100%. A rendered value outside 0–100 at
  zoom 1.0 is a **bug**, not an edge case.
- Pan is forced to `(0, 0)`: `setZoomLevel()` has an explicit
  `else if (newZoom === 1) { panX = 0; panY = 0; }`
  (`CODE_REVIEW_FLOOR_PLAN_ZOOM.md`).
- Zoom controls are hidden (`display:none`), since visibility is
  `floorPlanZoom > 1` (`ZOOM_MODAL_FLOW_DIAGRAM.md`).

### zoom > 1.0
- **Rendered coordinates outside 0–100% are correct and expected.** At zoom 1.5,
  a pin stored at 2% renders at `2*1.5 − 25 = −22%` and one at 98% renders at
  `122%`. Both mean "this part of the image is outside the container right now".
  The doc lists "Pin coordinates shouldn't go outside 0–100%" as a **common
  misconception** (`COORDINATE_FORMULA_EXPLANATION.md`).
- Pins visibly move as you zoom. Also expected — the centred image shifts under
  them; they stay locked to image content. "If pin moves when zooming, it's a
  bug" is listed as a misconception.
- 50% stays at 50% at every zoom. If it doesn't, the formula is broken.
- Ordering and centre-relative distances are preserved (distance scales by
  exactly `zoom`).
- Pan is bounded to `±overflow/2` — half the overflow, deliberately: the full
  range would park the image at an extreme edge, half gives a clean "edge snap"
  (`PAN_BOUNDS_FIX_SUMMARY.md`).
- Black space around the image must **never** appear. `PAN_BOUNDS_TESTING_GUIDE.md`
  treats it as the critical failure (Category 6) and `PAN_BOUNDS_EDGE_CASES_INVENTORY.md`
  works the algebra: at 150% with a 343px container, panning to the −85.75px
  limit puts the image's left edge exactly at the container's left edge with
  171.5px still overflowing right — no gap, *provided the limit is enforced*.

### Scroll
Positions are recomputed from the stored percentage against current scroll
state; `CLAUDE.md` requires `updateDisplayDimensions()` after scroll to refresh
the cached dimensions. Both the real pins and the pending placeholder pin are
positioned in image space so they scroll with the plan rather than sticking to
the viewport (`PENDING_PIN_IMPLEMENTATION.md` — its test list explicitly checks
"pending pin scrolls/pans with floor plan (not fixed to viewport)").

### Orientation change
`updateDisplayDimensions()` recalculates all dimensions (`CLAUDE.md`).
`PAN_BOUNDS_EDGE_CASES_INVENTORY.md` lists landscape/portrait container change
(§8.3) as unverified, alongside device-pixel-ratio effects on bounds (§8.2).

### Aspect ratio
Non-square images are where the naive formulas fail. `PAN_BOUNDS_FIX_SUMMARY.md`:
`displayedWidth ≈ containerWidth * Z` is "❌ WRONG for non-square". The inventory
flags portrait (height-constrained) vs landscape (width-constrained) as distinct
cases needing separate verification.

---

## 5. Cheap correctness checks

Before believing any change to this subsystem, verify these four properties from
`COORDINATE_FORMULA_EXPLANATION.md` — they catch most classes of error without a
device:

1. At zoom 1.0, `rendered ≈ stored` for stored values across 2–98%.
2. Stored 50% renders at 50% at *every* zoom level.
3. Ordering preserved: if `storedA < storedB`, then `renderedA < renderedB` at
   every zoom.
4. Symmetry: stored `50±X` renders at `50±X*zoom`.

Failure modes they distinguish: identical formula output for different zooms →
rounding/corruption; order inversion → formula error; asymmetry → offset applied
on one side only.

---

## 6. Contradictions between docs

These are unreconciled in the source material. Resolve them against the actual
shipped HTML before relying on either version.

**a) What is `displayedWidth`?** Three incompatible definitions:
- `COORDINATE_FORMULA_EXPLANATION.md`: `containerWidth * zoom` (its worked
  example: container 343px, at 1.5× → 514.5px). The `stored*zoom − (zoom−1)*50`
  formula is only valid under this definition.
- `PAN_BOUNDS_FIX_SUMMARY.md`: height-driven —
  `displayedHeight = containerHeight * zoom`, `displayedWidth = displayedHeight *
  aspectRatio`.
- `CODE_REVIEW_FLOOR_PLAN_ZOOM.md`, quoting `updateFloorPlanTransform()`:
  width-driven — `img.style.width = container.offsetWidth * zoom`, `height:auto`.

The first and third agree with each other and disagree with the second. Since
`enforcePanBounds()` uses the second while rendering uses the third, **the bounds
and the render can be computed from different displayed widths for the same
non-square image.** No doc addresses this.

**b) Pan bounds formula.** `CODE_REVIEW_FLOOR_PLAN_ZOOM.md` (2026-06-09) quotes
`setZoomLevel()` using `maxPanX = (containerWidth * (newZoom − 1)) / 2` and
concludes "APPROVED FOR PRODUCTION", "No Critical Issues Found".
`PAN_BOUNDS_FIX_SUMMARY.md` (2026-06-10) names that exact formula as the root
cause of out-of-bounds panning. Chronology favours the later doc, but the code
review's clean bill of health is still in the repo and reads as authoritative.

**c) Does the pan get applied twice on render?** `updateFloorPlanTransform()`
applies `translate(panX, panY)` as CSS to **both** `#plan-img` and `#plan-pins`
(`CODE_REVIEW_FLOOR_PLAN_ZOOM.md`), i.e. the pin layer is panned wholesale by the
browser. Yet `PIN_COORDINATE_SYSTEM_REDESIGN.md`'s `renderPins()` also subtracts
`floorPlanPanX` when computing each pin's `left`. If both are live
simultaneously, pan is applied twice to pins — structurally the same
double-accounting bug `REPOSITIONING_BUG_ANALYSIS.md` diagnosed on the tap side.
**No doc reconciles these two.** Determine empirically which is in the shipped
file before editing either.

**d) Two different state vocabularies.** The `PIN_EDIT_*` and
`COORDINATE_VERIFICATION.md` docs target `site-visit-form-no-zoom.html` /
`site-visit-form-lite.html` and use `state.audit.floors[].stations[].pinX/pinY`
with `saveState()` and `localStorage['auditState']`. The zoom/pan docs target
`Spare-it_site_visit_form_UPDATED.html` and use `S.floors[].stations[].x/.y` with
`persist()`. Same concepts, different names and a different file. Check which
build you are in before pattern-matching a fix across.

---

## 7. Open / unresolved

- **The 37.7px Y offset.** `BUG_ANALYSIS_Y_OFFSET.md`: all pins render ~37.7px
  too high, at 100% (37.74px) and 125% (37.62px) alike — constant, not
  zoom-dependent. X error is exactly 0.00px. The doc offers two unresolved
  hypotheses: either the *verification code's* "expected" formula is wrong and
  the pins are actually correct, or there is an unaccounted ~37px UI element
  (sticky header) between the container's `getBoundingClientRect()` origin and
  the absolute-positioning origin. `paddingTop:16px` is ruled out as
  insufficient. Its stated next action — compare `handlePlanTap()`'s conversion
  against `renderPins()` to confirm both use the same formula — **is not recorded
  anywhere as having been done.** A constant, zoom-independent, single-axis error
  is the signature of a mismatched origin, not of the zoom math.

- **The 0% tap accuracy finding.** `TAP_DATA_ANALYSIS.md` ends with a five-step
  action list (verify actual image dimensions, grep for hard-coded aspect ratios,
  trace the transformation, fix the mismatch, re-test). No later doc reports the
  outcome. Until someone confirms every offset path reads
  `img.naturalWidth/naturalHeight` dynamically, **treat non-4:3-landscape floor
  plans as unverified.**

- **Pan at zoom 1.0 is not actually zero.** `PAN_BOUNDS_EDGE_CASES_INVENTORY.md`
  §2.1 records ~11.5px of X pan observed at 100% where the expectation is 0, and
  asks "Why is any panning allowed at 100%?" — unanswered. Note `setZoomLevel()`
  hard-resets pan to 0 at zoom 1, so the residual likely enters via the pan
  gesture handler rather than via zoom.

- **The whole `PAN_BOUNDS_EDGE_CASES_INVENTORY.md` verification backlog.** Most
  entries read "Current Behavior: Needs verification". Explicitly unverified:
  all four pan-direction extremes; zoom change mid-drag; every non-square aspect
  ratio (16:9, 4:3, square, portrait); container-size responsiveness; momentum /
  fling handling ("No momentum handling visible"); multi-finger drag; tap during
  an active drag; tap at container corners; extreme-pan + extreme-tap; and
  visual jitter during bounds clamping.

- **Bounds vs black space.** The inventory proves the formula *should* prevent
  black space *if* the limits are enforced, and then closes on the open question
  it cannot answer from the math alone: "What if pan limits are NOT enforced or a
  bug allows pan past the limit?"

- **`updateDisplayDimensions()` and `floorPlanDisplayState` have no
  implementation doc.** Both are load-bearing — every corrected formula reads
  from the cache they populate — yet no doc in this set shows how they are
  computed or when they are invoked beyond "at floor load", "after scroll",
  "on orientation change" (`CLAUDE.md`). Likewise `baseContainerWidth` /
  `baseContainerHeight` appear only in `CLAUDE.md`, never in the coordinate docs.
  Read the source before assuming behaviour.

- **`highlightPositioningPin()` for displays.** Depends on a rendered display
  pin; since `renderPins()` omitted displays, there was nothing to highlight.
  Whether it works once display rendering is added is untested
  (`GATEWAY_DISPLAY_POSITIONING_ISSUES.md`, Issue #12).

- **Automated tests passing is not evidence.** `TAP_DATA_ANALYSIS.md`: 23/23
  automated tests passed while real-device accuracy was 0%, because the tests
  validated the algebra against the same wrong assumptions the code held. Any
  change here needs a real tap on a real image at a real zoom level.
