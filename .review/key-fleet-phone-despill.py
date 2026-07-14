"""Second pass: remove leftover blue halo/spill around phone edges."""
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

    # Build opaque mask
    opaque = [[pix[x, y][3] > 40 for x in range(w)] for y in range(h)]

    def near_transparent(x: int, y: int, rad: int = 3) -> bool:
        for dy in range(-rad, rad + 1):
            for dx in range(-rad, rad + 1):
                xx, yy = x + dx, y + dy
                if 0 <= xx < w and 0 <= yy < h and not opaque[yy][xx]:
                    return True
        return False

    cleaned = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a == 0:
                continue
            rf, gf, bf = float(r), float(g), float(b)
            d = dist(rf, gf, bf)
            luma = 0.2126 * rf + 0.7152 * gf + 0.0722 * bf
            blue_dom = max(0.0, bf - max(rf, gf))

            # Kill residual near-bg pixels
            if d < 50 and blue_dom > 45 and luma > 60:
                pix[x, y] = (0, 0, 0, 0)
                cleaned += 1
                continue

            # Edge blue glow / spill → despill or fade
            if near_transparent(x, y, 4) and blue_dom > 12:
                # Strong spill near transparency → fade out more
                if blue_dom > 55 and luma < 160:
                    fade = max(0.0, min(1.0, (blue_dom - 55) / 80))
                    na = int(a * (1 - 0.75 * fade))
                    if na < 12:
                        pix[x, y] = (0, 0, 0, 0)
                    else:
                        max_rg = max(rf, gf)
                        bf2 = bf * (1 - 0.9 * fade) + max_rg * (0.9 * fade)
                        # darken slightly so leftover doesn't read as blue glow
                        pix[x, y] = (
                            int(rf * (1 - 0.15 * fade)),
                            int(gf * (1 - 0.15 * fade)),
                            int(max(0, min(255, bf2))),
                            na,
                        )
                    cleaned += 1
                elif blue_dom > 20:
                    amt = max(0.0, min(0.95, (blue_dom - 20) / 70))
                    max_rg = max(rf, gf)
                    bf2 = bf * (1 - amt) + max_rg * amt
                    pix[x, y] = (r, g, int(max(0, min(255, bf2))), a)
                    cleaned += 1

            # Soft blue shadow patches that read as glow: convert to dark alpha
            elif blue_dom > 40 and luma < 120 and d < 130 and a < 230:
                strength = max(0.0, min(1.0, 1.0 - luma / 120.0))
                shade = int(luma * 0.12)
                na = int(max(15, min(a, strength * 170)))
                pix[x, y] = (shade, shade, shade, na)
                cleaned += 1

    im.save(OUT, "WEBP", quality=97, method=6)
    im.save(OUT_PREVIEW, "PNG", optimize=True)
    print("cleaned", cleaned)
    print("wrote", OUT, OUT.stat().st_size)


if __name__ == "__main__":
    main()
