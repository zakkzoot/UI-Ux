#!/usr/bin/env python3
"""Give a cropped art element a transparent background so it can sit on a
colored slide background without a visible box.

Detects the background color from the image corners, turns pixels near that
color transparent (with a soft alpha ramp so edges stay smooth), and
optionally trims the image to its visible content.

Usage:
  python make_overlay.py icon.png                 # in-place, keep size
  python make_overlay.py divider.png --trim       # in-place + trim to content
  python make_overlay.py enso.png -o enso_t.png   # write elsewhere

Prints the final pixel size — use it to place the image at its true aspect
ratio in the deck.

Requires: numpy, Pillow.
"""
import argparse

import numpy as np
from PIL import Image, ImageFilter


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("image")
    ap.add_argument("--trim", action="store_true",
                    help="crop to the bounding box of visible pixels")
    ap.add_argument("--threshold", type=float, default=14.0,
                    help="color distance below which pixels are fully "
                         "transparent (default 14)")
    ap.add_argument("--ramp", type=float, default=28.0,
                    help="distance range over which alpha ramps 0->255 "
                         "(default 28)")
    ap.add_argument("-o", "--out", help="output path (default: overwrite input)")
    args = ap.parse_args()

    im = Image.open(args.image).convert("RGB")
    a = np.asarray(im, dtype=np.float32)

    # background = median of the four corner patches
    c = 24
    corners = np.concatenate([
        a[:c, :c].reshape(-1, 3), a[:c, -c:].reshape(-1, 3),
        a[-c:, :c].reshape(-1, 3), a[-c:, -c:].reshape(-1, 3)])
    bgcol = np.median(corners, axis=0)

    dist = np.sqrt(((a - bgcol) ** 2).sum(axis=2))
    alpha = np.clip((dist - args.threshold) / args.ramp, 0, 1) * 255
    al = Image.fromarray(alpha.astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(1.2))

    rgba = im.convert("RGBA")
    rgba.putalpha(al)

    if args.trim:
        arr = np.asarray(al)
        ys, xs = np.where(arr > 20)
        if len(ys):
            rgba = rgba.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

    out = args.out or args.image
    rgba.save(out)
    print(f"wrote {out}  size={rgba.width}x{rgba.height}  "
          f"aspect={rgba.width / rgba.height:.4f}")


if __name__ == "__main__":
    main()
