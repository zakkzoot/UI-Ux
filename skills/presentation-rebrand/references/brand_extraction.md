# Brand extraction & asset harvesting (phases 2–3)

## Writing the design brief

After rendering every reference page/image, capture this before touching any
code. Ten minutes here saves hours of rework.

### Palette
Run `scripts/palette.py` over 3–5 representative pages, then refine by eye
(sample exact pixels if needed). Lock in named roles and never improvise
colors outside them:

| Role | What it does | Typical count |
|---|---|---|
| Background | The "paper" every slide sits on | 1 |
| Ink | Main text color, near-black or deep brand tone | 1 |
| Accents | Chips, numbers, labels, highlights | 2–4 |
| Card | Panel fill slightly off the background | 1 |
| Outline | Border color for panels/chips (often near-black) | 1 |

Sample the background from the reference's own art pages — your slide
background must match the art's paper color closely, or every full-bleed
image will show as a visible rectangle.

### Typography
Identify the reference's type personality and map it to fonts staff machines
actually have. Two fonts max: a heading face and a body face. Reference decks
made by AI tools often use a *different* font per page — pick the dominant
feel and standardize; consistency beats fidelity.

### Motifs
List every recurring device: divider lines, framed panels, circles, borders,
icon style, corner ornaments, texture. Choose 1–2 to repeat on every slide.
A deck reads as "branded" because of repetition, not variety.

### Per-image inventory
For each reference page: what the art depicts, which regions are empty
(usable for text), what content it could metaphorically carry, and whether
its baked-in text needs removal. This table *is* your phase-4 mapping input.

## Harvesting assets

Render high-res (150 dpi is enough for slides): `pdftoppm -png -r 150`.

1. **Full pages you'll reuse as slide backgrounds** → clean baked text with
   `clean_art.py`, save as JPEG quality ~88.
2. **Elements you'll overlay on colored backgrounds** (icons, dividers,
   ornaments, partial art) → crop from the cleaned page, then
   `make_overlay.py --trim` so no background box shows. Note the printed
   aspect ratio and always place at that ratio.
3. **Watermarks / tool credits** → `--watermark` rects (median-filtered out).

### Cleaning checklist — look at every asset before building

Render each cleaned asset and inspect it fresh. The recurring faults:

| Symptom | Cause | Fix |
|---|---|---|
| Faint "ghost" of the old text | Rect missed it or ghost is subtle | Widen the rect; the flatten pass handles subtle ghosts — check the rect actually covers the text |
| Text at rect edge half-visible | Edge feather zone | Extend the rect so text sits ≥60px inside every edge |
| Big bold text survives cleaning | Strokes thicker than protection limit | Raise `--thick` to 45–60 for that image |
| Artwork nicked/erased inside rect | Thin art strokes unprotected | Shrink the rect away from the art, or lower `--thick` |
| Smear where rect edge crosses art | Fill color polluted near art | Move the rect edge off the artwork |
| Overlay shows a colored box on slides | No transparency | Run `make_overlay.py` on it |
| Slide bg visibly differs from art bg | Palette mismatch | Re-sample the background from the art itself |

## Mode B: images-only reference (no source deck/PDF to clean)

When the brand reference is a folder of photos/illustrations/logos:

- Palette and motifs come from the images (`palette.py`) plus any brand
  guide the user names.
- Skip text removal; you may still want `make_overlay.py` for logos and
  cut-out elements.
- Assign images to slides by metaphor and by where their empty space is; if
  an image has no empty space, use it half-bleed (one side of the slide)
  with text on a solid panel beside it.
- Consistent treatment matters: same corner radius / border / crop ratio for
  every image so mixed sources still read as one system.

## Mode C: no content deck — building fresh from notes

Same pipeline, but phase 1's "content" is the user's outline. Draft the
slide list first (title, sections, one idea per slide), confirm it with the
user if they're available, then proceed exactly as a rebrand.
