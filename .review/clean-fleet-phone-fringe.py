"""Final fringe cleanup on qpick-fleet-phone.webp — remove residual blue halos."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

OUT = Path(r"D:\quickpickapp\public\images\fleet\qpick-fleet-phone.webp")


def main() -> None:
    im = Image.open(OUT).convert("RGBA")
    w, h = im.size
    px = im.load()
    src = [[px[x, y] for x in range(w)] for y in range(h)]

    cleaned = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = src[y][x]
            if a < 1:
                continue

            # Residual pure field blue rim inside phone
            if b > 210 and r < 70 and g < 150 and b > r + 100 and b > g + 80:
                # If mostly surrounded by transparent/blue, drop; else despill
                trans = 0
                metal = 0
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        if dx == 0 and dy == 0:
                            continue
                        xx, yy = x + dx, y + dy
                        if not (0 <= xx < w and 0 <= yy < h):
                            continue
                        rr, gg, bb, aa = src[yy][xx]
                        if aa < 8:
                            trans += 1
                        elif rr + gg + bb < 260 and abs(rr - gg) < 40:
                            metal += 1
                if trans >= 3:
                    px[x, y] = (0, 0, 0, 0)
                    cleaned += 1
                    continue
                # despill toward metal gray
                target = (r + g) * 0.5
                mix = 0.85
                rr = int(round(r * (1 - mix) + target * mix))
                gg = int(round(g * (1 - mix) + target * mix))
                bb = int(round(b * (1 - mix) + target * mix))
                # lower alpha slightly on fringe
                na = a
                if metal >= 2:
                    na = min(a, 200)
                px[x, y] = (rr, gg, bb, na)
                cleaned += 1

    # Soften leftover cool fringe on semi-alpha pixels
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if 1 <= a <= 220 and b > max(r, g) + 40 and b > 160:
                target = (r + g) * 0.5
                mix = 0.9
                rr = int(round(r * (1 - mix) + target * mix))
                gg = int(round(g * (1 - mix) + target * mix))
                bb = int(round(b * (1 - mix) + target * mix))
                px[x, y] = (rr, gg, bb, a)
                cleaned += 1

    assert im.size == (w, h)
    im.save(OUT, format="WEBP", quality=96, method=6)
    print("fringe_cleaned", cleaned, "wrote", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
