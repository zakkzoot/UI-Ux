---
name: presentation-rebrand
description: >
  Redesign and rebrand a presentation: take the content of one slide deck (or
  document) word-for-word, extract the visual identity from a reference source
  — another deck, a PDF, a brand guide, or a folder of images — and rebuild the
  deck as a polished, on-brand .pptx. Use this whenever someone wants to
  "rebrand", "restyle", "redesign", "make it look like", "apply our branding
  to", or "match the style of" a presentation; whenever they supply one file
  for content and another for design; or whenever they want a new branded deck
  built from a set of brand images or an existing visual style. Also use it to
  build a fresh presentation in a house style from bullet points plus brand
  imagery.
---

# Presentation Rebrand

Turn any deck's content + any visual reference into one coherent branded
presentation. The core promise: **content is preserved word-for-word and in
order; the design is rebuilt from the reference's actual visual DNA** — its
real artwork, palette, and typography, not a generic imitation.

Only use reference material the user owns or has rights to use.

## The workflow

Work through these phases in order. Each has a detailed reference file — read
it when you reach that phase.

```
1. Extract content  →  2. Study the brand  →  3. Harvest & clean assets
        →  4. Map art to content  →  5. Build the .pptx  →  6. QA loop
```

If a `pptx` skill is available in your environment, load it too — its
pptxgenjs gotchas and validation scripts complement this workflow.

## 1. Extract the content (it is sacred)

Get every word out of the content source and treat it as immutable:

- `.pptx` → `markitdown deck.pptx > content.md` (one block per slide).
- PDF / docx → extract text per page (`pdftotext`, `markitdown`).
- Bullet notes → use as given.

Keep the slide order exactly as the source unless the user says otherwise.
Record the structure of each slide (title, subtitle, lists, footers, labels,
things like "SCAN TO OPEN" placeholders) — the rebuild must carry all of it.
At the end of the project you will verify, line by line, that nothing was
dropped (phase 6). Uppercasing a label for styling counts as a change; when
the user asked for word-for-word, keep the original casing.

## 2. Study the brand reference

Render everything so you can see it:

- Reference PDF → `pdftoppm -png -r 150 ref.pdf pages/pg` (check the real
  page count with `pdfinfo` first).
- Reference deck → convert to PDF with LibreOffice, then render.
- Image folder → just view the images.

Look at every page/image and write down a short design brief:

- **Palette**: run `python scripts/palette.py pages/*.png` for dominant
  colors, then refine by eye. Assign roles: background, ink (main text), 2–4
  accents, card/panel fill. One color should dominate; one should be the
  sharp accent.
- **Typography**: identify the feel (geometric rounded? grotesque? serif?)
  and pick the closest widely-installed match. Prefer fonts that render
  faithfully in your QA renderer (Arial, Calibri, Cambria, Century Schoolbook,
  Bookman Old Style); a close match outside that list (e.g. Century Gothic
  for a rounded geometric face) is fine for short headings if you leave ~10%
  width slack.
- **Motifs**: recurring devices — brush strokes, circles, dividers, framed
  panels, icon styles, textures. Pick one or two to repeat across every slide
  so the deck reads as one system.
- **Per-image inventory**: for each reference page, note what the artwork
  depicts, where the empty space is, and what kind of slide it could carry.

Read `references/brand_extraction.md` for the full checklist and for the
images-only case (no reference deck, just brand photos/illustrations).

## 3. Harvest and clean the art

The reference's own artwork is what makes the result feel authentic. Three
operations, all scripted:

- **Remove baked-in text** from a page you want to reuse:
  `python scripts/clean_art.py page.png --rect 0.46,0.28,0.99,0.70 -o clean.jpg`
  Rects are fractions of width/height covering the old text. The script
  estimates the local background, protects thick artwork blobs, and flattens
  everything else (including faint anti-aliasing ghosts) with feathered
  edges. Add `--watermark x0,y0,x1,y1` to median-out small watermarks, and
  `--thick 50` when the baked text is very large/bold and survives cleaning.
- **Make overlays transparent** (crops that will sit on a colored slide
  background — icons, dividers, ornaments):
  `python scripts/make_overlay.py crop.png --trim`
  Prints the final pixel size; use it to keep aspect ratios exact.
- **Crop reusable elements**: dividers, icons, corner ornaments, a signature
  motif. Crop from the *cleaned* image.

Always re-render and **look at** every cleaned asset before building. Common
faults and fixes are listed in `references/brand_extraction.md` ("Cleaning
checklist").

## 4. Map artwork to content

This mapping is where the deck becomes good instead of decorated:

- **Full-bleed art pages → light slides** (title, section breaks, short
  statements, thank-you). Put the text in the artwork's empty region — the
  spot where the reference's own text used to sit.
- **Base-color background + drawn elements → dense slides** (grids, lists,
  tables of roles). Rebuild the reference's panel/divider/chip language with
  shapes: rounded rectangles with the reference's border style, its colors,
  its label typography.
- **Match metaphors to meaning.** A stepping-stone image carries a
  step-by-step slide; a fleet of boats carries a team slide; a locked gate
  carries a policy slide. Content that names N items pairs beautifully with
  art that shows N things.
- **When text must sit on busy art, put it in a panel card** — a filled
  rounded rectangle in the card color with the reference's border treatment.
  Never let body text fight the artwork for contrast.
- Recurring slide types (agendas, checkpoints, dividers) get one template,
  built once as a function, with a progress device drawn from the motif
  (e.g. the reference's circle ornament holding the current section number).

## 5. Build the deck

Generate with **pptxgenjs** (Node). Read `references/build_and_qa.md` first —
it holds the layout system, the helper-function pattern, and the pptxgenjs
footguns that corrupt files (color formats, shadow offsets, shared option
objects, chart rules).

Principles that matter more than any individual rule:

- Set the slide size to match the source deck (usually 13.33"×7.5").
- Define the palette and two fonts as constants; write small helpers
  (eyebrow, title, chip, divider, panel) and compose every slide from them —
  consistency is what makes it look designed.
- Full-slide art goes in as a background image; overlays go in as
  transparent PNGs at their true aspect ratio.
- Body text ≥ 12pt, titles 26–40pt bold, generous margins (≥0.5"), and left
  alignment for anything that is a sentence or a list.

## 6. QA until it is actually right (do not skip)

The first render always has issues. Loop:

1. `python <pptx-skill>/scripts/office/validate.py out.pptx` (or open in
   PowerPoint) — must pass.
2. Render every slide to images (LibreOffice → PDF → `pdftoppm`) and *look
   at each one fresh*: text overflowing or colliding with art, overlay
   images showing background boxes, leftover ghost text in cleaned art,
   uneven spacing, low contrast.
3. Fix in the generator (or re-clean the asset), re-render, re-check.
4. **Content verification**: script a line-by-line comparison of the source
   extraction against `markitdown out.pptx`. Every line of the source must
   appear in the output. Zero missing lines is the exit criterion.

Deliver the `.pptx` plus one sentence on where placeholders (QR codes, logos)
need real files dropped in.

## Bundled resources

| File | When to use |
|---|---|
| `scripts/clean_art.py` | Remove baked-in text/watermarks from reference art |
| `scripts/make_overlay.py` | Give crops transparent backgrounds (+ trim) |
| `scripts/palette.py` | Sample dominant colors from reference images |
| `references/brand_extraction.md` | Phase 2–3 details: brief checklist, cleaning faults & fixes, images-only mode |
| `references/build_and_qa.md` | Phase 5–6 details: pptxgenjs patterns, footguns, QA commands |

Scripts need Python 3 with `numpy`, `scipy`, `Pillow` (`pip install numpy
scipy Pillow`). Building needs Node with `pptxgenjs` (`npm install pptxgenjs`).
Rendering QA needs LibreOffice and Poppler (`pdftoppm`).
