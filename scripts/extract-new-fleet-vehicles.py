"""Extract Wagon R, High Roof Van, Flat Roof Van from NEW fleet design."""
from __future__ import annotations

from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
from scipy import ndimage

SRC = Path(
    r"C:\Users\User\.cursor\projects\d-quickpickapp\assets"
    r"\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images"
    r"_ChatGPT_Image_Jul_19__2026__03_00_23_PM-f6c5e4f1-6209-4bea-b0b9-777dc4cb0034.png"
)
OUT = Path(r"D:\quickpickapp\public\images\fleet\vehicles")
WORK = Path(r"D:\quickpickapp\.tmp-vehicle-extract")
SESSION = new_session("birefnet-general")
TARGET_W, TARGET_H = 1200, 720
UPSCALE = 4
PAD_RATIO = 0.12

# Left → right: Wagon R, High Roof Van, Flat Roof Van
# Vehicle band only (exclude NEW badge, titles, prices)
BOXES = {
    # Include full tires / bumpers; keep below NEW badge
    "wagon-r": (0.045, 0.248, 0.325, 0.55),
    "high-roof-van": (0.36, 0.22, 0.655, 0.56),
    "flat-roof-van": (0.68, 0.248, 0.98, 0.55),
}


def rembg_alpha(rgb: Image.Image):
    buf = BytesIO()
    rgb.save(buf, format="PNG")
    out = Image.open(BytesIO(remove(buf.getvalue(), session=SESSION))).convert("RGBA")
    return np.asarray(out.split()[-1], dtype=np.uint8)


def refine(a: np.ndarray) -> np.ndarray:
    fg = a > 20
    labeled, n = ndimage.label(fg)
    if n > 1:
        sizes = ndimage.sum(fg, labeled, range(1, n + 1))
        fg = labeled == (int(np.argmax(sizes)) + 1)
    fg = ndimage.binary_fill_holes(fg)
    soft = ndimage.gaussian_filter(fg.astype(np.float32), sigma=0.7)
    rem = np.where(fg, a.astype(np.float32), 0.0)
    combined = np.clip(np.maximum(soft * 255.0, rem), 0, 255).astype(np.uint8)
    combined = np.where(combined < 18, 0, np.where(combined > 230, 255, combined))
    return combined.astype(np.uint8)


def fit(im: Image.Image) -> Image.Image:
    a = im.split()[-1]
    bb = a.point(lambda v: 255 if v > 8 else 0).getbbox()
    if not bb:
        raise RuntimeError("empty")
    t = im.crop(bb)
    pad = int(min(TARGET_W, TARGET_H) * PAD_RATIO)
    tw, th = t.size
    scale = min((TARGET_W - 2 * pad) / tw, (TARGET_H - 2 * pad) / th)
    nw, nh = max(1, int(tw * scale)), max(1, int(th * scale))
    t2 = t.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 0))
    canvas.paste(t2, ((TARGET_W - nw) // 2, (TARGET_H - nh) // 2), t2)
    return canvas


def main() -> None:
    WORK.mkdir(exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC).convert("RGB")
    w, h = src.size
    print("source", w, h)
    for name, (x0, y0, x1, y1) in BOXES.items():
        crop = src.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
        crop.save(WORK / f"_crop-{name}.png")
        up = crop.resize((crop.size[0] * UPSCALE, crop.size[1] * UPSCALE), Image.Resampling.LANCZOS)
        a = rembg_alpha(up)
        a = refine(a)
        out = Image.merge("RGBA", (*up.split(), Image.fromarray(a, "L")))
        r, g, b, aa = out.split()
        aa = aa.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
        aa = aa.filter(ImageFilter.GaussianBlur(0.35))
        out = Image.merge("RGBA", (r, g, b, aa))
        asset = fit(out)
        path = OUT / f"{name}.webp"
        asset.save(path, "WEBP", quality=95, method=6)
        print("wrote", path, path.stat().st_size)


if __name__ == "__main__":
    main()
