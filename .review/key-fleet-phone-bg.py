"""Remove solid brand-blue background from fleet phone mockup; preserve phone + soft shadow."""
from __future__ import annotations

from pathlib import Path
from PIL import Image
import math

SRC = Path(r"D:\quickpickapp\public\images\fleet\qpick-fleet-phone.webp")
OUT = Path(r"D:\quickpickapp\public\images\fleet\qpick-fleet-phone.webp")
OUT_PREVIEW = Path(r"D:\quickpickapp\.review\qpick-fleet-phone-alpha-preview.png")

BG_R, BG_G, BG_B = 0.0, 83.0, 248.0


def dist(r: float, g: float, b: float) -> float:
    return math.sqrt((r - BG_R) ** 2 + (g - BG_G) ** 2 + (b - BG_B) ** 2)


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    pix = im.load()

    transparent = opaque = soft = 0

    for y in range(h):
        for x in range(w):
            r, g, b, _a = pix[x, y]
            rf, gf, bf = float(r), float(g), float(b)
            d = dist(rf, gf, bf)
            luma = 0.2126 * rf + 0.7152 * gf + 0.0722 * bf
            blue_dom = max(0.0, bf - max(rf, gf))

            hard = d < 42
            soft_fringe = (d < 95) and (blue_dom > 40) and (luma > 55) and not hard
            shadow = (
                (blue_dom > 25)
                and (luma < 95)
                and (d > 25)
                and (d < 160)
                and not hard
            )

            if hard:
                pix[x, y] = (0, 0, 0, 0)
                transparent += 1
                continue

            if soft_fringe and not shadow:
                t = max(0.0, min(1.0, (d - 42) / 53))
                alpha = int(t * 40)
                if alpha < 8:
                    pix[x, y] = (0, 0, 0, 0)
                    transparent += 1
                else:
                    pix[x, y] = (r, g, b, alpha)
                    soft += 1
                continue

            if shadow:
                strength = max(0.0, min(1.0, 1.0 - (luma / 95.0)))
                bg_w = max(0.0, min(1.0, 1.0 - (d / 160.0)))
                alpha = int(max(20, min(210, (strength * 0.85 + (1 - bg_w) * 0.15) * 200)))
                shade = int(max(0, min(255, luma * 0.15)))
                pix[x, y] = (shade, shade, int(shade * 1.1), alpha)
                soft += 1
                continue

            # Blue spill despill on remaining opaque edges
            if (blue_dom > 18) and (d < 140) and (luma < 200):
                amt = max(0.0, min(0.85, (blue_dom - 18) / 80))
                max_rg = max(rf, gf)
                bf2 = bf * (1 - amt) + max_rg * amt
                pix[x, y] = (r, g, int(max(0, min(255, bf2))), 255)
                opaque += 1
            else:
                # second pass leftover near-bg
                if (d < 55) and (blue_dom > 60) and (luma > 70):
                    pix[x, y] = (0, 0, 0, 0)
                    transparent += 1
                else:
                    opaque += 1

    assert im.size == (w, h)
    im.save(OUT, "WEBP", quality=97, method=6)
    im.save(OUT_PREVIEW, "PNG", optimize=True)
    print("size", im.size)
    print("transparent~", transparent, "opaque~", opaque, "soft~", soft)
    print("wrote", OUT, OUT.stat().st_size)
    print("preview", OUT_PREVIEW)


if __name__ == "__main__":
    main()
