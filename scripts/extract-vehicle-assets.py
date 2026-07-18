"""
Extract Q Pick vehicle cutouts from the showcase mockup.
Produces transparent WebP assets @ 1200x720 + ZIP.

Keep the rembg silhouette intact — aggressive post-processing
(flood-carve / GrabCut / white-fringe strip) punches holes in white paint.
"""

from __future__ import annotations

import zipfile
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
from scipy import ndimage

SRC = Path(
    r"C:\Users\User\.cursor\projects\d-quickpickapp\assets"
    r"\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images"
    r"_ChatGPT_Image_Jul_19__2026__01_55_41_AM-2a3556b1-4a8c-4912-ab52-e9f4a3079862.png"
)
OUT_DIR = Path(r"D:\quickpickapp\public\images\fleet\vehicles")
ZIP_PATH = Path(r"D:\quickpickapp\qpick-vehicle-assets.zip")
WORK = Path(r"D:\quickpickapp\.tmp-vehicle-extract")
TARGET_W = 1200
TARGET_H = 720
PAD_RATIO = 0.08
UPSCALE = 4

NAMES = [
    "bike",
    "tuk",
    "mini",
    "flex",
    "sedan",
    "minivan",
    "fr-van",
    "suv",
    "mini-bus",
    "bus",
]

CARD_VEHICLE_BOXES = [
    (0.048, 0.172, 0.205, 0.338),
    (0.233, 0.172, 0.390, 0.338),
    (0.418, 0.172, 0.575, 0.338),
    (0.603, 0.172, 0.760, 0.338),
    (0.788, 0.172, 0.945, 0.338),
    (0.048, 0.500, 0.205, 0.660),
    (0.233, 0.500, 0.390, 0.660),
    (0.418, 0.500, 0.575, 0.660),
    (0.603, 0.500, 0.760, 0.660),
    (0.788, 0.500, 0.945, 0.660),
]

# birefnet handles product cutouts; isnet kept as fallback name if needed
SESSION = new_session("birefnet-general")


def frac_box(im: Image.Image, box: tuple[float, float, float, float]) -> tuple[int, int, int, int]:
    w, h = im.size
    x0, y0, x1, y1 = box
    return (int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h))


def alpha_bbox(im: Image.Image, threshold: int = 8) -> tuple[int, int, int, int] | None:
    alpha = im.split()[-1]
    mask = alpha.point(lambda a: 255 if a > threshold else 0)
    return mask.getbbox()


def rembg_rgba(rgb: Image.Image) -> Image.Image:
    buf = BytesIO()
    rgb.convert("RGB").save(buf, format="PNG")
    return Image.open(BytesIO(remove(buf.getvalue(), session=SESSION))).convert("RGBA")


def refine_alpha(rgb: Image.Image, alpha: Image.Image) -> Image.Image:
    """Light cleanup only: largest component, mild hole fill, soft shadow trim."""
    a = np.asarray(alpha, dtype=np.uint8)
    arr = np.asarray(rgb.convert("RGB"), dtype=np.int16)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    h, w = a.shape

    fg = a > 20

    # Keep largest blob
    labeled, n = ndimage.label(fg)
    if n > 1:
        sizes = ndimage.sum(fg, labeled, range(1, n + 1))
        fg = labeled == (int(np.argmax(sizes)) + 1)

    # Fill only truly enclosed holes (safe for white paint interiors)
    fg = ndimage.binary_fill_holes(fg)

    # Soft ground shadow: gray pixels in lower band connected to bottom via soft/bg
    soft = (np.abs(r - g) <= 12) & (np.abs(g - b) <= 12) & (r >= 145) & (r <= 235)
    dark = (r < 70) & (g < 70) & (b < 70)
    y = np.arange(h)[:, None]
    lower = y > int(h * 0.62)
    bottom = np.zeros_like(fg)
    bottom[-3:, :] = True
    walk = soft | ~fg
    from_bottom = ndimage.binary_propagation(bottom, mask=walk)
    drop_shadow = soft & lower & fg & ~dark & from_bottom
    # Don't drop if pixel is strongly opaque vehicle core (high rembg confidence)
    drop_shadow &= a < 200
    fg[drop_shadow] = False

    # Blue glow fringe on edge only (not interior white)
    edge = fg & ndimage.binary_dilation(~fg, iterations=2)
    blue_glow = (b > r + 12) & (g > r + 5) & (b >= 220) & (r >= 180)
    fg[edge & blue_glow] = False

    # Rebuild alpha: harden core from rembg, soft edge
    core = fg & (a > 60)
    soft_a = ndimage.gaussian_filter(core.astype(np.float32), sigma=0.7)
    # Preserve rembg soft edge where still in fg
    rembg_soft = np.where(fg, a.astype(np.float32), 0.0)
    combined = np.maximum(soft_a * 255.0, rembg_soft)
    combined = np.clip(combined, 0, 255).astype(np.uint8)
    combined = np.where(combined < 18, 0, np.where(combined > 230, 255, combined)).astype(np.uint8)
    return Image.fromarray(combined, mode="L")


def clean_edges(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    r, g, b, a = im.split()
    a = a.filter(ImageFilter.MinFilter(3))
    a = a.filter(ImageFilter.MaxFilter(3))
    a = a.filter(ImageFilter.GaussianBlur(0.35))
    a = a.point(lambda v: 0 if v < 16 else (255 if v > 225 else v))
    return Image.merge("RGBA", (r, g, b, a))


def fit_canvas(im: Image.Image, canvas_w: int = TARGET_W, canvas_h: int = TARGET_H) -> Image.Image:
    im = im.convert("RGBA")
    bbox = alpha_bbox(im)
    if not bbox:
        raise RuntimeError("Empty alpha after extraction")
    trimmed = im.crop(bbox)
    tw, th = trimmed.size
    pad = int(min(canvas_w, canvas_h) * PAD_RATIO)
    max_w = canvas_w - pad * 2
    max_h = canvas_h - pad * 2
    scale = min(max_w / tw, max_h / th)
    nw = max(1, int(round(tw * scale)))
    nh = max(1, int(round(th * scale)))
    scaled = trimmed.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    canvas.paste(scaled, ((canvas_w - nw) // 2, (canvas_h - nh) // 2), scaled)
    return canvas


def extract_one(src: Image.Image, box: tuple[float, float, float, float], name: str) -> Image.Image:
    crop = src.crop(frac_box(src, box)).convert("RGB")
    WORK.mkdir(parents=True, exist_ok=True)
    crop.save(WORK / f"_crop-{name}.png")

    uw, uh = crop.size[0] * UPSCALE, crop.size[1] * UPSCALE
    up = crop.resize((uw, uh), Image.Resampling.LANCZOS)

    cut = rembg_rgba(up)
    cut.save(WORK / f"_rembg-{name}.png")

    # Use ORIGINAL RGB (rembg can alter colors) with rembg alpha
    alpha = refine_alpha(up, cut.split()[-1])
    out = Image.merge("RGBA", (*up.split(), alpha))
    out = clean_edges(out)
    out.save(WORK / f"_cut-{name}.png")
    return fit_canvas(out)


def write_qa(asset: Image.Image, name: str) -> None:
    w, h = asset.size
    tile = 24
    qa = Image.new("RGB", (w, h))
    px = qa.load()
    for y in range(h):
        for x in range(w):
            px[x, y] = (255, 255, 255) if ((x // tile) + (y // tile)) % 2 == 0 else (200, 200, 200)
    qa.paste(asset, (0, 0), asset)
    qa.save(WORK / f"_qa-{name}.png")


def main() -> None:
    assert SRC.exists(), f"Missing source: {SRC}"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)

    src = Image.open(SRC).convert("RGB")
    print(f"Source: {src.size}")

    exported: list[Path] = []
    for name, box in zip(NAMES, CARD_VEHICLE_BOXES):
        print(f"Extracting {name}...")
        asset = extract_one(src, box, name)
        path = OUT_DIR / f"{name}.webp"
        asset.save(path, "WEBP", quality=95, method=6)
        write_qa(asset, name)
        print(f"  -> {path.name} {asset.size} ({path.stat().st_size} bytes)")
        exported.append(path)

    if ZIP_PATH.exists():
        ZIP_PATH.unlink()
    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for p in exported:
            zf.write(p, arcname=p.name)
    print(f"ZIP: {ZIP_PATH} ({ZIP_PATH.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
