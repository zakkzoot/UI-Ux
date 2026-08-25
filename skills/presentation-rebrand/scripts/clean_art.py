#!/usr/bin/env python3
"""Remove baked-in text (and watermarks) from reference artwork.

Given one image and one or more fractional rectangles that cover the old
text, this estimates the local paper/background color, protects thick
artwork blobs, and flattens everything else in the rect — including the
faint anti-aliasing ghosts a simple threshold misses — with feathered
edges so the patch blends into the page.

Usage:
  python clean_art.py page.png --rect 0.46,0.28,0.99,0.70 -o clean.jpg
  python clean_art.py page.png --rect 0.02,0.05,0.55,0.36 --thick 50 \
      --watermark 0.87,0.95,0.998,0.99 -o clean.jpg

Notes:
  * rect/watermark coords are x0,y0,x1,y1 as FRACTIONS of width/height.
  * --thick (default 28, in pixels at the image's own resolution) is the
    stroke half-thickness above which dark blobs count as protected
    artwork. Raise it (45-60) when very large/bold baked text survives
    cleaning; lower it if thin artwork strokes inside the rect get eaten.
  * Draw rects with margin: text should sit >= 60px from every rect edge,
    or the edge feather will leave a partial ghost.

Requires: numpy, scipy, Pillow.
"""
import argparse

import numpy as np
import scipy.ndimage as ndi
from PIL import Image, ImageFilter

LUMA = np.array([0.299, 0.587, 0.114], dtype=np.float32)


def frect(rect, W, H):
    x0, y0, x1, y1 = rect
    return int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)


def clean_rect(im, rect, thick=28):
    W, H = im.size
    x0, y0, x1, y1 = frect(rect, W, H)
    a = np.asarray(im.crop((x0, y0, x1, y1)), dtype=np.float32)
    h, w = a.shape[:2]
    lum = a @ LUMA

    # Per-tile background estimate from light pixels only; tiles that are
    # solid artwork fall back to the median light-tile color so the fill
    # stays paper-colored near art.
    T = 64
    ty, tx = max(1, h // T), max(1, w // T)
    bg = np.zeros((ty, tx, 3), np.float32)
    filled = np.zeros((ty, tx), bool)
    for i in range(ty):
        for j in range(tx):
            ys = slice(i * h // ty, (i + 1) * h // ty)
            xs = slice(j * w // tx, (j + 1) * w // tx)
            tl, tp = lum[ys, xs], a[ys, xs]
            m = tl > max(150.0, np.percentile(tl, 75) - 10)
            if m.sum() > 40:
                bg[i, j] = tp[m].reshape(-1, 3).mean(axis=0)
                filled[i, j] = True
    neutral = (np.median(bg[filled].reshape(-1, 3), axis=0)
               if filled.any() else np.array([245, 240, 220], np.float32))
    bg[~filled] = neutral

    bgim = Image.fromarray(bg.astype(np.uint8)).resize((w, h), Image.BILINEAR)
    bgim = bgim.filter(ImageFilter.GaussianBlur(8))
    bglum = np.asarray(bgim, dtype=np.float32) @ LUMA

    # Artwork = strongly-dark blobs thicker than any text stroke. The strict
    # threshold keeps anti-aliasing halos from fattening text into "art".
    # Morphological opening via two distance transforms: cores are points
    # deeper than `thick` inside a dark blob; dilating cores back rebuilds
    # the full blob.
    dark = lum < bglum - 45
    core = ndi.distance_transform_edt(dark) > thick
    art = ndi.distance_transform_edt(~core) <= thick + 10

    # Everything that isn't protected art gets flattened to a coarse
    # background gradient — this wipes ghosts a threshold can't see.
    cw, ch = max(1, w // 500), max(1, h // 500)
    coarse = bgim.resize((cw, ch), Image.BOX).resize((w, h), Image.BILINEAR)
    coarse = np.asarray(coarse.filter(ImageFilter.GaussianBlur(20)),
                        dtype=np.float32)

    # Feather the rect border so the patch blends into the page.
    F = 40.0
    yy = np.minimum(np.arange(h), np.arange(h)[::-1])[:, None].astype(np.float32)
    xx = np.minimum(np.arange(w), np.arange(w)[::-1])[None, :].astype(np.float32)
    edge = np.clip(np.minimum(yy, xx) / F, 0, 1)
    blend = np.where(art, 0.0, edge)[..., None]
    out = (a * (1 - blend) + coarse * blend).astype(np.uint8)
    im.paste(Image.fromarray(out), (x0, y0))


def median_patch(im, rect, size=15, passes=2):
    """Erase small thin marks (watermarks) with a median filter."""
    W, H = im.size
    x0, y0, x1, y1 = frect(rect, W, H)
    for _ in range(passes):
        c = im.crop((x0, y0, x1, y1)).filter(ImageFilter.MedianFilter(size))
        im.paste(c, (x0, y0))


def parse_rect(s):
    parts = [float(p) for p in s.split(",")]
    if len(parts) != 4:
        raise argparse.ArgumentTypeError("rect must be x0,y0,x1,y1 fractions")
    return tuple(parts)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("image")
    ap.add_argument("--rect", type=parse_rect, action="append", default=[],
                    help="fractional rect covering baked-in text (repeatable)")
    ap.add_argument("--watermark", type=parse_rect, action="append", default=[],
                    help="fractional rect covering a small watermark (repeatable)")
    ap.add_argument("--thick", type=int, default=28,
                    help="artwork stroke half-thickness in px (default 28)")
    ap.add_argument("-o", "--out", required=True)
    args = ap.parse_args()

    im = Image.open(args.image).convert("RGB")
    for r in args.rect:
        clean_rect(im, r, thick=args.thick)
    for r in args.watermark:
        median_patch(im, r)
    if args.out.lower().endswith((".jpg", ".jpeg")):
        im.save(args.out, quality=90)
    else:
        im.save(args.out)
    print(f"wrote {args.out} ({im.width}x{im.height})")


if __name__ == "__main__":
    main()
