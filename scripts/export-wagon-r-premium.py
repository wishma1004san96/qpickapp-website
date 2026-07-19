"""Premium wagon-r.webp — clean cutout, no labels/shadows, equal pad."""
from __future__ import annotations

from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from rembg import new_session, remove
from scipy import ndimage

SRC = Path(
    r"C:\Users\User\.cursor\projects\d-quickpickapp\assets"
    r"\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images"
    r"_ChatGPT_Image_Jul_19__2026__09_37_17_PM-81f2bf9f-b963-4c82-a571-a5bfdea1dff5.png"
)
OUT = Path(r"D:\quickpickapp\public\images\fleet\vehicles\wagon-r.webp")
QA = Path(r"D:\quickpickapp\.tmp-vehicle-extract\_wagon-r-premium-qa.png")
WORK = Path(r"D:\quickpickapp\.tmp-vehicle-extract")

TARGET_W, TARGET_H = 1200, 720
CONTENT_HEIGHT_RATIO = 0.50
SESSION = new_session("birefnet-general")


def rembg_cutout(rgb: Image.Image) -> Image.Image:
    buf = BytesIO()
    rgb.save(buf, format="PNG")
    return Image.open(BytesIO(remove(buf.getvalue(), session=SESSION))).convert("RGBA")


def content_box(alpha: np.ndarray, thr: int = 20):
    ys = np.where(np.any(alpha > thr, axis=1))[0]
    xs = np.where(np.any(alpha > thr, axis=0))[0]
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def remove_floor_shadow(rgba: Image.Image) -> Image.Image:
    a = np.asarray(rgba).copy()
    rgb = a[:, :, :3].astype(np.float32)
    alpha = a[:, :, 3].astype(np.float32)
    gray = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    x0, y0, x1, y1 = content_box(alpha)
    h = y1 - y0 + 1
    band = np.zeros_like(alpha, dtype=bool)
    band[y0 + int(h * 0.78) : y1 + 3, :] = True
    # Soft gray shadow under car (not black tires)
    shadow = (
        band
        & (alpha > 5)
        & (gray > 85)
        & (gray < 235)
        & (sat < 30)
    )
    tires = (gray < 65) & (alpha > 50)
    shadow &= ~ndimage.binary_dilation(tires, iterations=3)
    exterior = alpha < 10
    touch = ndimage.binary_dilation(exterior, iterations=3) & shadow
    seed = touch.copy()
    seed[-3:, :] |= shadow[-3:, :]
    kill = ndimage.binary_propagation(seed, mask=shadow)
    alpha[kill] = 0
    a[:, :, 3] = alpha.astype(np.uint8)
    return Image.fromarray(a, "RGBA")


def blank_plate_text(rgba: Image.Image) -> Image.Image:
    """Fill front nameplate rectangle solid black (removes WAGON R lettering)."""
    a = np.asarray(rgba).copy()
    rgb = a[:, :, :3]
    alpha = a[:, :, 3]
    gray = rgb.mean(axis=2)
    x0, y0, x1, y1 = content_box(alpha)
    cw, ch = max(1, x1 - x0), max(1, y1 - y0)
    # Bumper band covering the nameplate
    py0 = y0 + int(ch * 0.66)
    py1 = y0 + int(ch * 0.80)
    px0 = x0 + int(cw * 0.60)
    px1 = x0 + int(cw * 0.82)
    zone = np.zeros_like(alpha, dtype=bool)
    zone[py0:py1, px0:px1] = True
    dark = zone & (alpha > 40) & (gray < 55)
    if not dark.any():
        return rgba
    labeled, n = ndimage.label(dark)
    # Expected plate center ~ (0.71, 0.73) of vehicle bbox
    ex, ey = x0 + cw * 0.71, y0 + ch * 0.73
    best_i, best_score = None, -1e18
    for i in range(1, n + 1):
        comp = labeled == i
        s = int(comp.sum())
        if s < 500 or s > 80000:
            continue
        ys, xs = np.where(comp)
        bw = int(xs.max() - xs.min() + 1)
        bh = int(ys.max() - ys.min() + 1)
        aspect = bw / max(1, bh)
        if aspect < 1.3:
            continue
        cx = float(xs.mean())
        cy = float(ys.mean())
        dist = ((cx - ex) / cw) ** 2 + ((cy - ey) / ch) ** 2
        score = s * aspect - dist * 200000
        if score > best_score:
            best_score = score
            best_i = i
    if best_i is None:
        return rgba
    plate = labeled == best_i
    ys, xs = np.where(plate)
    ya = max(0, int(ys.min()) - 4)
    yb = min(alpha.shape[0], int(ys.max()) + 5)
    xa = max(0, int(xs.min()) - 10)
    xb = min(alpha.shape[1], int(xs.max()) + 10)
    rect = np.zeros_like(plate)
    rect[ya:yb, xa:xb] = True
    rgb[rect & (alpha > 40)] = (12, 12, 12)
    a[:, :, :3] = rgb
    return Image.fromarray(a, "RGBA")


def remove_side_badge(rgba: Image.Image) -> Image.Image:
    """Remove small hybrid/chrome badge on front fender; blend into white paint."""
    a = np.asarray(rgba).copy()
    rgb = a[:, :, :3].astype(np.float32)
    alpha = a[:, :, 3]
    gray = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    x0, y0, x1, y1 = content_box(alpha)
    fy0 = y0 + int((y1 - y0) * 0.40)
    fy1 = y0 + int((y1 - y0) * 0.58)
    fx0 = x0 + int((x1 - x0) * 0.52)
    fx1 = x0 + int((x1 - x0) * 0.70)
    zone = np.zeros_like(alpha, dtype=bool)
    zone[fy0:fy1, fx0:fx1] = True
    badge = zone & (alpha > 40) & (sat > 28) & (gray > 35) & (gray < 210)
    # Small components only
    labeled, n = ndimage.label(badge)
    mask = np.zeros_like(badge)
    for i in range(1, n + 1):
        comp = labeled == i
        s = int(comp.sum())
        if 15 < s < 1800:
            mask |= comp
    if not mask.any():
        return rgba
    mask = ndimage.binary_dilation(mask, iterations=2)
    # Neighbor white paint samples
    ring = ndimage.binary_dilation(mask, iterations=8) & ~mask & (alpha > 40) & (sat < 25) & (gray > 180)
    if ring.any():
        color = np.median(rgb[ring], axis=0)
    else:
        color = np.array([235.0, 235.0, 235.0])
    rgb[mask] = color
    a[:, :, :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    return Image.fromarray(a, "RGBA")


def remove_grille_emblem(rgba: Image.Image) -> Image.Image:
    """Blend Suzuki S emblem into surrounding grille chrome."""
    a = np.asarray(rgba).copy()
    rgb = a[:, :, :3].astype(np.float32)
    alpha = a[:, :, 3]
    gray = rgb.mean(axis=2)
    x0, y0, x1, y1 = content_box(alpha)
    gy0 = y0 + int((y1 - y0) * 0.40)
    gy1 = y0 + int((y1 - y0) * 0.56)
    gx0 = x0 + int((x1 - x0) * 0.60)
    gx1 = x0 + int((x1 - x0) * 0.76)
    zone = np.zeros_like(alpha, dtype=bool)
    zone[gy0:gy1, gx0:gx1] = True
    # Emblem is a compact mid-dark chrome island
    cand = zone & (alpha > 40) & (gray > 40) & (gray < 160)
    labeled, n = ndimage.label(cand)
    mask = np.zeros_like(cand)
    for i in range(1, n + 1):
        comp = labeled == i
        s = int(comp.sum())
        if 80 < s < 3500:
            mask |= comp
    if not mask.any():
        return rgba
    mask = ndimage.binary_dilation(mask, iterations=1)
    ring = ndimage.binary_dilation(mask, iterations=5) & ~mask & (alpha > 40)
    if not ring.any():
        return rgba
    color = np.median(rgb[ring], axis=0)
    rgb[mask] = color
    a[:, :, :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    return Image.fromarray(a, "RGBA")


def refine_alpha(rgba: Image.Image) -> Image.Image:
    a = np.asarray(rgba).copy()
    alpha = a[:, :, 3]
    fg = alpha > 18
    labeled, n = ndimage.label(fg)
    if n > 1:
        sizes = ndimage.sum(fg, labeled, range(1, n + 1))
        fg = labeled == (int(np.argmax(sizes)) + 1)
    fg = ndimage.binary_fill_holes(fg)
    soft = ndimage.gaussian_filter(fg.astype(np.float32), sigma=0.7)
    alpha2 = np.clip(np.maximum(soft * 255.0, np.where(fg, alpha, 0).astype(np.float32)), 0, 255)
    alpha2 = np.where(alpha2 < 10, 0, np.where(alpha2 > 242, 255, alpha2))
    a[:, :, 3] = alpha2.astype(np.uint8)
    return Image.fromarray(a, "RGBA")


def fit_equal_pad(im: Image.Image) -> Image.Image:
    bb = im.split()[-1].point(lambda v: 255 if v > 12 else 0).getbbox()
    if not bb:
        raise RuntimeError("empty")
    cropped = im.crop(bb)
    tw, th = cropped.size
    target_h = int(TARGET_H * CONTENT_HEIGHT_RATIO)
    scale = target_h / th
    max_w = int(TARGET_W * 0.72)
    if int(tw * scale) > max_w:
        scale = max_w / tw
    nw, nh = max(1, int(tw * scale)), max(1, int(th * scale))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    rgb = resized.convert("RGB")
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.4)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.05)
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.1, percent=110, threshold=2))
    resized = Image.merge("RGBA", (*rgb.split(), resized.split()[-1]))
    canvas = Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 0))
    canvas.paste(resized, ((TARGET_W - nw) // 2, (TARGET_H - nh) // 2), resized)
    return canvas


def main() -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC).convert("RGB")
    # 3× upscale for cleaner edges after downscale to catalog size
    hi = src.resize((src.width * 3, src.height * 3), Image.Resampling.LANCZOS)
    print("upscaled", hi.size)

    cut = rembg_cutout(hi)
    cut.save(WORK / "_wagon-r-rembg.png")
    cut = remove_floor_shadow(cut)
    cut = blank_plate_text(cut)
    cut = remove_side_badge(cut)
    cut = remove_grille_emblem(cut)
    cut = refine_alpha(cut)
    cut.save(WORK / "_wagon-r-cleaned.png")

    fitted = fit_equal_pad(cut)
    fitted.save(OUT, "WEBP", lossless=True, quality=100, method=6)

    arr = np.asarray(fitted)
    bg = np.full_like(arr, [255, 20, 147, 255])
    m = arr[:, :, 3:4] / 255.0
    comp = (arr.astype(float) * m + bg.astype(float) * (1 - m)).astype(np.uint8)
    Image.fromarray(comp, "RGBA").convert("RGB").save(QA)

    alpha = arr[:, :, 3]
    ys = np.where(np.any(alpha > 20, axis=1))[0]
    xs = np.where(np.any(alpha > 20, axis=0))[0]
    print(
        "saved",
        OUT.name,
        OUT.stat().st_size,
        "margins T/B/L/R",
        int(ys.min()),
        TARGET_H - 1 - int(ys.max()),
        int(xs.min()),
        TARGET_W - 1 - int(xs.max()),
        "hp%",
        round(100 * (ys.max() - ys.min() + 1) / TARGET_H, 1),
    )


if __name__ == "__main__":
    main()
