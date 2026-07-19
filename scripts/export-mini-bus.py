"""Export Q Mini Bus transparent WebP from studio shot."""
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
    r"_ChatGPT_Image_Jul_19__2026__09_58_24_PM-47cb9306-57f4-4d0a-8c46-abb6a7821815.png"
)
OUT = Path(r"D:\quickpickapp\public\images\fleet\vehicles\mini-bus.webp")
QA = Path(r"D:\quickpickapp\.tmp-vehicle-extract\_mini-bus-qa.png")
WORK = Path(r"D:\quickpickapp\.tmp-vehicle-extract")

TARGET_W, TARGET_H = 1200, 720
# Long vehicle — match catalog height weight of other fleet cards
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
    band[y0 + int(h * 0.76) : y1 + 4, :] = True
    shadow = band & (alpha > 4) & (gray > 80) & (gray < 240) & (sat < 35)
    # Protect tires and blue bumper plastics
    dark = (gray < 70) & (alpha > 40)
    blue = (rgb[:, :, 2] > rgb[:, :, 0] + 25) & (rgb[:, :, 2] > 80) & (alpha > 40)
    shadow &= ~ndimage.binary_dilation(dark | blue, iterations=3)
    exterior = alpha < 10
    seed = ndimage.binary_dilation(exterior, iterations=3) & shadow
    seed[-4:, :] |= shadow[-4:, :]
    kill = ndimage.binary_propagation(seed, mask=shadow)
    alpha[kill] = 0
    a[:, :, 3] = alpha.astype(np.uint8)
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
    alpha2 = np.clip(
        np.maximum(soft * 255.0, np.where(fg, alpha, 0).astype(np.float32)),
        0,
        255,
    )
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
    max_w = int(TARGET_W * 0.78)
    if int(tw * scale) > max_w:
        scale = max_w / tw
    nw, nh = max(1, int(tw * scale)), max(1, int(th * scale))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    rgb = resized.convert("RGB")
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.35)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.04)
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.1, percent=110, threshold=2))
    resized = Image.merge("RGBA", (*rgb.split(), resized.split()[-1]))
    canvas = Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 0))
    canvas.paste(resized, ((TARGET_W - nw) // 2, (TARGET_H - nh) // 2), resized)
    return canvas


def main() -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC).convert("RGB")
    hi = src.resize((src.width * 3, src.height * 3), Image.Resampling.LANCZOS)
    print("upscaled", hi.size)

    cut = rembg_cutout(hi)
    cut.save(WORK / "_mini-bus-rembg.png")
    cut = remove_floor_shadow(cut)
    cut = refine_alpha(cut)
    cut.save(WORK / "_mini-bus-cleaned.png")

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
