# Building the .pptx and QA (phases 5–6)

## Generator structure

Write one Node script with pptxgenjs (`npm install pptxgenjs`). Structure it
so consistency is automatic:

```js
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in — match the source deck

// 1. Palette + fonts as constants (from your design brief)
const BG = "F8F2D4", INK = "1F2A44", ACCENT = "D8532F", CARD = "FCF7E1",
      OUTLINE = "1C1C1C";
const HEAD = "Century Gothic", BODY = "Arial";

// 2. Small helpers — every slide composes these, nothing is one-off
const bgArt = (s, img) => s.addImage({ path: img, x: 0, y: 0, w: 13.333, h: 7.5 });
const eyebrow = (s, t, x, y) => s.addText(t, { x, y, w: 7.5, h: 0.32,
  fontFace: HEAD, fontSize: 12.5, bold: true, color: ACCENT,
  charSpacing: 3, margin: 0 });
function chip(s, text, x, y, w, h, fill) {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.09,
    fill: { color: fill }, line: { color: OUTLINE, width: 2.75 } });
  s.addText(text, { x, y, w, h, align: "center", valign: "middle",
    fontFace: HEAD, fontSize: 13, bold: true, color: CARD, margin: 0.03 });
}

// 3. A function per recurring slide type (agenda, section break, ...)
// 4. One block per slide, in source order
pres.writeFile({ fileName: "out.pptx" });
```

Layout rules of thumb:

- Overlay PNGs: place at their true aspect (`h = w / aspect` from
  `make_overlay.py`'s printed ratio) or they'll squash.
- Text on busy art → panel card first (CARD fill + OUTLINE border), text on
  top of the card.
- Titles 26–40pt bold, body 12–14pt, captions 10–11pt; margins ≥ 0.5";
  left-align sentences and lists, center only short labels.
- Where the reference uses a divider/ornament between rows, place your
  cropped transparent divider image centered in the row gap.

## pptxgenjs footguns (these corrupt files or silently fail)

- Hex colors: **never** `#`, never 8-digit-with-alpha — `"FF0000"` only.
  For translucency use `transparency: 0-100` on fills/images.
- pptxgenjs **mutates option objects** — never share one options/shadow
  object across two `add*` calls; build fresh objects each time.
- Shadow `offset` must be ≥ 0 (use `angle` to change direction).
- `rectRadius` only works on `"roundRect"`, not `"rect"`.
- Gradient fills are unsupported — use a gradient image instead.
- Lists: `bullet: true` per item (never a literal "•"), `breakLine: true`
  on all but the last item, space with `paraSpaceAfter` not `lineSpacing`.
- Text boxes have built-in padding — set `margin: 0` when aligning text
  with shapes/images at the same x.
- Letter spacing is `charSpacing` (`letterSpacing` is silently ignored).
- One `new pptxgen()` per output file.
- Charts: stacked bars need `dataLabelPosition` of `ctr`/`inEnd`/`inBase`
  (`outEnd` corrupts); combo charts using secondary axes need both
  `valAxes` and `catAxes` arrays (two entries each) or PowerPoint drops
  the chart.

## Fonts and QA trust

Font names render on the *audience's* machine. Safe both for wide install
base and faithful QA rendering: Arial, Calibri, Cambria, Times New Roman,
Century Schoolbook, Bookman Old Style. A personality heading font outside
that list (Century Gothic, Georgia, Trebuchet MS) is fine for short
headings if you leave ~10% width slack — your QA renderer substitutes it,
so don't trust apparent overflow/fit on those elements. Never use Aptos.

## The QA loop

```bash
# 1. structural validation (from the pptx skill if present, else open the file)
python <pptx-skill>/scripts/office/validate.py out.pptx

# 2. render every slide
soffice --headless --convert-to pdf out.pptx
rm -f slide-*.jpg && pdftoppm -jpeg -r 100 out.pdf slide

# 3. LOOK at every image
```

Inspect each render as if you've never seen it (a subagent works well —
after staring at generator code you see what you expect, not what rendered):

- Text overflowing its box or the slide — the most common defect.
- Text colliding with artwork → move it, or put it in a panel card.
- Overlay images showing background boxes → run `make_overlay.py`.
- Leftover ghost text in cleaned art → back to `clean_art.py` (see the
  cleaning checklist in `brand_extraction.md`).
- Uneven gaps, elements < 0.3" apart, margins < 0.5".
- Low-contrast text on art or tinted fills.

Fix in the generator or the asset, rebuild, re-render **all four commands**,
re-check. Two or three rounds is normal.

## Content verification (exit criterion)

Script it — do not eyeball it:

```bash
markitdown source.pptx > src.md      # or the original extraction
markitdown out.pptx > new.md
python - <<'EOF'
import re
src = open('src.md').read(); new = re.sub(r'\s+', ' ', open('new.md').read())
miss = [re.sub(r'\s+', ' ', l).strip() for l in src.splitlines()]
miss = [l for l in miss if l and not l.startswith(('<!--','![','###')) and l not in new]
print("missing lines:", len(miss)); [print(" -", m) for m in miss]
EOF
```

Zero missing lines = done. Casing counts: if the user asked for
word-for-word, a label you uppercased for style is a miss — restore the
original casing.
