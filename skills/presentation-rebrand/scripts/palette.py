#!/usr/bin/env python3
"""Sample the dominant colors of one or more reference images and suggest
brand-palette roles.

Usage:
  python palette.py pages/pg-01.png pages/pg-05.png
  python palette.py brand_images/*.jpg -n 10

Prints hex codes with pixel share, sorted by coverage, and a suggested role
split (background / ink / accents) based on lightness and saturation. Treat
the roles as a starting point — confirm them by eye against the reference.

Requires: numpy, Pillow.
"""
import argparse
import colorsys

import numpy as np
from PIL import Image


def dominant(images, n):
    pixels = []
    for path in images:
        im = Image.open(path).convert("RGB")
        im.thumbnail((400, 400))
        pixels.append(np.asarray(im).reshape(-1, 3))
    data = np.concatenate(pixels)
    # quantize via PIL's median-cut on the pooled pixels
    side = int(np.ceil(np.sqrt(len(data))))
    pad = side * side - len(data)
    pooled = Image.fromarray(
        np.concatenate([data, data[:pad]]).reshape(side, side, 3).astype(np.uint8))
    q = pooled.quantize(colors=n, method=Image.MEDIANCUT)
    pal = np.array(q.getpalette()[:n * 3]).reshape(-1, 3)
    counts = np.bincount(np.asarray(q).ravel(), minlength=n)
    order = np.argsort(-counts)
    total = counts.sum()
    return [(pal[i], counts[i] / total) for i in order if counts[i] > 0]


def role(rgb, share):
    r, g, b = [v / 255 for v in rgb]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    if l > 0.82 and share > 0.15:
        return "background (dominant light)"
    if l < 0.30:
        return "ink / dark text"
    if s > 0.35:
        return "accent"
    return "supporting tone"


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("images", nargs="+")
    ap.add_argument("-n", type=int, default=8, help="number of colors (default 8)")
    args = ap.parse_args()

    for rgb, share in dominant(args.images, args.n):
        hexc = "%02X%02X%02X" % tuple(int(v) for v in rgb)
        print(f"#{hexc}  {share * 100:5.1f}%  {role(rgb, share)}")


if __name__ == "__main__":
    main()
