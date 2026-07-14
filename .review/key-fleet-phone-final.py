"""Chroma-key brand blue from fleet phone; neutral dark shadow; no blue halo."""
from __future__ import annotations

from pathlib import Path
from PIL import Image
import math

SRC = Path(r"D:\quickpickapp\.review\_qpick_fleet_preview.png")
OUT = Path(r"D:\quickpickapp\public\images\fleet\qpick-fleet-phone.webp")
OUT_PREVIEW = Path(r"D:\quickpickapp\.review\qpick-fleet-phone-alpha-preview.png")

# Measured solid stage blue
BG = (0.0, 83.0, 248.0)


def dist_bg(r: float, g: float, b: float) -> float:
    return math.sqrt((r - BG[0]) ** 2 + (g - BG[1]) ** 2 + (b - BG[2]) ** 2)


def blue_dom(r: float, g: float, b: float) -> float:
    return max(0.0, b - max(r, g))


def luma(r: float, g: float, b: float) -> float:
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    assert (w, h) == (1456, 1080)
    pix = im.load()

    hard_n = soft_n = shadow_n = keep_n = 0

    # Pass 1: key + classify
    out = Image.new("RGBA", (w, h))
    opix = out.load()

    for y in range(h):
        for x in range(w):
            r, g, b, _ = pix[x, y]
            rf, gf, bf = float(r), float(g), float(b)
            d = dist_bg(rf, gf, bf)
            L = luma(rf, gf, bf)
            bd = blue_dom(rf, gf, bf)

            # Pure / near stage blue → fully transparent
            if d < 38:
                opix[x, y] = (0, 0, 0, 0)
                hard_n += 1
                continue

            # Soft fringe into blue (halo candidates): fade hard
            if d < 78 and bd > 35 and L > 50:
                # Map distance to alpha; despill RGB toward neutral
                t = (d - 38) / 40.0  # 0..1
                # Prefer kill of blue glow: keep almost nothing as blue fringe
                alpha = int(max(0, min(255, t * t * 28)))
                if alpha < 10:
                    opix[x, y] = (0, 0, 0, 0)
                    hard_n += 1
                else:
                    shade = int(max(0, min(255, L * 0.2)))
                    opix[x, y] = (shade, shade, shade, alpha)
                    soft_n += 1
                continue

            # Blue-tinted contact shadow / underglow (reads as blue floor)
            # Keep as neutral soft shadow, never blue
            if bd > 22 and L < 110 and d < 155:
                strength = max(0.0, min(1.0, 1.0 - L / 110.0))
                bg_mix = max(0.0, min(1.0, 1.0 - (d - 38) / 117.0))
                # Stronger key contribution → thinner / darker, no chroma
                alpha = int(max(18, min(200, strength * (1.0 - 0.35 * bg_mix) * 185)))
                shade = int(max(0, min(40, L * 0.18)))
                opix[x, y] = (shade, shade, shade, alpha)
                shadow_n += 1
                continue

            # Remaining opaque: optional mild edge despill only if very blue-dominant
            # Do NOT touch bright UI whites / screen content
            rr, gg, bb = r, g, b
            if bd > 28 and L < 190 and d < 120:
                amt = min(0.75, (bd - 28) / 90.0)
                max_rg = max(rf, gf)
                bb = int(max(0, min(255, bf * (1 - amt) + max_rg * amt)))
            opix[x, y] = (rr, gg, bb, 255)
            keep_n += 1

    # Pass 2: kill leftover blue-biased pixels abutting transparency (halo cleanup)
    opaque = [[opix[x, y][3] > 48 for x in range(w)] for y in range(h)]
    cleaned = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = opix[x, y]
            if a == 0:
                continue
            rf, gf, bf = float(r), float(g), float(b)
            bd = blue_dom(rf, gf, bf)
            L = luma(rf, gf, bf)
            d = dist_bg(rf, gf, bf)

            near_hole = False
            for dy in range(-3, 4):
                for dx in range(-3, 4):
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < w and 0 <= yy < h and not opaque[yy][xx]:
                        near_hole = True
                        break
                if near_hole:
                    break

            if not near_hole:
                continue

            # Kill residual near-bg blues at silhouette
            if d < 55 and bd > 40:
                opix[x, y] = (0, 0, 0, 0)
                cleaned += 1
                continue

            # Soft blue glow fringe → neutral or fade
            if bd > 18 and L < 160:
                amt = min(1.0, (bd - 18) / 60.0)
                # convert to dark alpha, strip chroma
                shade = int(L * 0.15 * (1 - 0.5 * amt))
                na = int(a * (1 - 0.85 * amt))
                if na < 14:
                    opix[x, y] = (0, 0, 0, 0)
                else:
                    opix[x, y] = (shade, shade, shade, na)
                cleaned += 1

    out.save(OUT, "WEBP", quality=97, method=6)
    # Preview on dark gray for QC
    bg = Image.new("RGBA", (w, h), (28, 28, 30, 255))
    Image.alpha_composite(bg, out).save(OUT_PREVIEW, "PNG", optimize=True)

    print("size", out.size, "mode", out.mode)
    print("hard", hard_n, "soft", soft_n, "shadow", shadow_n, "keep", keep_n, "edge_clean", cleaned)
    print("bytes", OUT.stat().st_size)
    print("wrote", OUT)


if __name__ == "__main__":
    main()
