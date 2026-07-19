"""
Complete Wagon R tires by reflecting pixels over the cut line (horizontal diameter).
"""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
from scipy import ndimage

SRC = Path(
    r"C:\Users\User\.cursor\projects\d-quickpickapp\assets"
    r"\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images"
    r"_ChatGPT_Image_Jul_19__2026__03_00_23_PM-f6c5e4f1-6209-4bea-b0b9-777dc4cb0034.png"
)
OUT = Path(r"D:\quickpickapp\public\images\fleet\vehicles\wagon-r.webp")
WORK = Path(r"D:\quickpickapp\.tmp-vehicle-extract")
SESSION = new_session("birefnet-general")
TARGET_W, TARGET_H = 1200, 720


def extract() -> np.ndarray:
    src = Image.open(SRC).convert("RGB")
    w, h = src.size
    crop = src.crop((int(0.04 * w), int(0.225 * h), int(0.34 * w), int(0.565 * h)))
    up = crop.resize((crop.size[0] * 5, crop.size[1] * 5), Image.Resampling.LANCZOS)
    buf = BytesIO()
    up.save(buf, format="PNG")
    rem = Image.open(BytesIO(remove(buf.getvalue(), session=SESSION))).convert("RGBA")
    a = np.asarray(rem.split()[-1])
    fg = a > 24
    labeled, n = ndimage.label(fg)
    if n > 1:
        sizes = ndimage.sum(fg, labeled, range(1, n + 1))
        fg = labeled == (int(np.argmax(sizes)) + 1)
    a2 = np.where(fg, np.maximum(a, 220), 0).astype(np.uint8)
    return np.dstack([np.asarray(up.convert("RGB")), a2])


def wheels_on_cut_line(rgba: np.ndarray) -> tuple[list[tuple[int, int]], int]:
    """Return list of (cx, radius) for tire segments on the bottom content row."""
    h, w = rgba.shape[:2]
    alpha = rgba[:, :, 3]
    gray = cv2.cvtColor(rgba[:, :, :3], cv2.COLOR_RGB2GRAY)
    rows = np.any(alpha > 40, axis=1)
    yb = int(np.where(rows)[0].max())

    # Use several rows near bottom for stability
    band = slice(max(0, yb - 4), yb + 1)
    tire_cols = ((gray[band] < 100) & (alpha[band] > 40)).any(axis=0)
    # Remove thin noise
    tire_cols = ndimage.binary_closing(tire_cols, structure=np.ones(9))
    tire_cols = ndimage.binary_opening(tire_cols, structure=np.ones(5))

    labeled, n = ndimage.label(tire_cols)
    wheels: list[tuple[int, int, int]] = []  # mass, cx, r
    for i in range(1, n + 1):
        xs = np.where(labeled == i)[0]
        width = int(xs.max() - xs.min() + 1)
        if width < int(w * 0.04) or width > int(w * 0.22):
            continue
        # Verify this column range is a wheel: enough dark mass above cut
        x1, x2 = int(xs.min()), int(xs.max())
        roi = (gray[max(0, yb - width) : yb + 1, x1 : x2 + 1] < 100) & (
            alpha[max(0, yb - width) : yb + 1, x1 : x2 + 1] > 40
        )
        mass = int(roi.sum())
        if mass < width * 6:
            continue
        cx = int(round((x1 + x2) / 2))
        r = int(round(width / 2))
        wheels.append((mass, cx, r))

    wheels.sort(reverse=True)
    # Keep two best left/right separated
    picked: list[tuple[int, int]] = []
    for mass, cx, r in wheels:
        if any(abs(cx - pcx) < (r + pr) * 0.7 for pcx, pr in picked):
            continue
        picked.append((cx, r))
        if len(picked) == 2:
            break
    picked.sort(key=lambda t: t[0])
    print("wheels", picked, "yb", yb, "canvas", w, h)
    return picked, yb


def reflect_complete(rgba: np.ndarray) -> np.ndarray:
    wheels, yb = wheels_on_cut_line(rgba)
    if not wheels:
        raise RuntimeError("no wheels detected on cut line")

    max_r = max(r for _, r in wheels)
    extend = int(max_r * 1.15) + 8
    h, w = rgba.shape[:2]
    out = np.zeros((h + extend, w, 4), dtype=np.uint8)
    out[:h] = rgba

    for cx, r in wheels:
        r = int(r * 1.02)
        # Reflect every dy into the extension, sampling mirror source
        for dy in range(1, r + 1):
            src_y = yb - dy
            dst_y = yb + dy
            if src_y < 0 or dst_y >= out.shape[0]:
                continue
            for dx in range(-r, r + 1):
                if dx * dx + dy * dy > r * r:
                    continue
                x = cx + dx
                if x < 0 or x >= w:
                    continue
                # Only write empty destination
                if out[dst_y, x, 3] >= 20:
                    continue
                # Prefer opaque source; if missing, use nearby tire black
                if rgba[src_y, x, 3] >= 20:
                    out[dst_y, x] = rgba[src_y, x]
                else:
                    # fallback: sample horizontally toward center/up
                    found = False
                    for sy in range(src_y, max(-1, src_y - 12), -1):
                        if rgba[sy, x, 3] >= 20:
                            out[dst_y, x] = rgba[sy, x]
                            found = True
                            break
                    if not found:
                        out[dst_y, x] = (20, 20, 22, 255)

        # Fill remaining empty disk bottom with tire black (anti-alias later)
        yy, xx = np.ogrid[: out.shape[0], :w]
        disk = ((xx - cx) ** 2 + (yy - yb) ** 2 <= r * r) & (yy > yb)
        need = disk & (out[:, :, 3] < 15)
        out[need] = (18, 18, 20, 255)

    return out


def fit_canvas(rgba: np.ndarray, pad_ratio: float = 0.16) -> Image.Image:
    im = Image.fromarray(rgba, "RGBA")
    r, g, b, a = im.split()
    a = a.filter(ImageFilter.GaussianBlur(0.35))
    a = a.point(lambda v: 0 if v < 10 else (255 if v > 210 else v))
    im = Image.merge("RGBA", (r, g, b, a))
    bb = im.split()[-1].point(lambda v: 255 if v > 8 else 0).getbbox()
    t = im.crop(bb)
    pad = int(min(TARGET_W, TARGET_H) * pad_ratio)
    tw, th = t.size
    scale = min((TARGET_W - 2 * pad) / tw, (TARGET_H - 2 * pad) / th)
    nw, nh = max(1, int(tw * scale)), max(1, int(th * scale))
    t2 = t.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 0))
    canvas.paste(t2, ((TARGET_W - nw) // 2, (TARGET_H - nh) // 2), t2)
    return canvas


def main() -> None:
    WORK.mkdir(exist_ok=True)
    cut = extract()
    Image.fromarray(cut).save(WORK / "_wagon-cut.png")
    fixed = reflect_complete(cut)
    Image.fromarray(fixed).save(WORK / "_wagon-wheels-fixed.png")
    asset = fit_canvas(fixed)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    asset.save(OUT, "WEBP", quality=95, method=6)

    qa = Image.new("RGB", asset.size)
    px = qa.load()
    for y in range(asset.size[1]):
        for x in range(asset.size[0]):
            px[x, y] = (255, 255, 255) if ((x // 24) + (y // 24)) % 2 == 0 else (210, 210, 210)
    qa.paste(asset, (0, 0), asset)
    qa.save(WORK / "_qa-wagon-r-fixed.png")
    print("wrote", OUT, OUT.stat().st_size)


if __name__ == "__main__":
    main()
