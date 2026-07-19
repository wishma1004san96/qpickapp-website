"""Re-export Q Mini (Wagon R) with full vehicle + equal generous padding."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

SRC = Path(
    r"C:\Users\User\.cursor\projects\d-quickpickapp\assets\wagon-r-full-wheels-v2.png"
)
OUT = Path(r"D:\quickpickapp\public\images\fleet\vehicles\wagon-r.webp")
QA = Path(r"D:\quickpickapp\.tmp-vehicle-extract\_wagon-r-qa-pink.png")

TARGET_W, TARGET_H = 1200, 720
# Extra breathing room so UI overflow/hover never clips edges
PAD_RATIO = 0.16
WHITE_THR = 248


def white_key(rgb: Image.Image) -> Image.Image:
    """Strict exterior white flood → transparent. Keeps tires/paint intact."""
    arr = np.asarray(rgb.convert("RGB"), dtype=np.uint8)
    h, w = arr.shape[:2]
    near_white = (
        (arr[:, :, 0] >= WHITE_THR)
        & (arr[:, :, 1] >= WHITE_THR)
        & (arr[:, :, 2] >= WHITE_THR)
    )
    seed = np.zeros((h, w), dtype=bool)
    seed[0, :] = near_white[0, :]
    seed[-1, :] = near_white[-1, :]
    seed[:, 0] = near_white[:, 0]
    seed[:, -1] = near_white[:, -1]
    exterior = ndimage.binary_propagation(seed, mask=near_white)
    alpha = np.where(exterior, 0, 255).astype(np.uint8)
    # Soften only near exterior edge
    edge = exterior ^ ndimage.binary_erosion(exterior, iterations=1)
    soft = ndimage.gaussian_filter(edge.astype(np.float32), sigma=0.6)
    alpha = np.clip(alpha.astype(np.float32) - soft * 90, 0, 255).astype(np.uint8)
    rgba = np.dstack([arr, alpha])
    return Image.fromarray(rgba, "RGBA")


def fit_equal_pad(im: Image.Image) -> Image.Image:
    alpha = im.split()[-1]
    bb = alpha.point(lambda v: 255 if v > 12 else 0).getbbox()
    if not bb:
        raise RuntimeError("empty alpha")
    cropped = im.crop(bb)
    tw, th = cropped.size
    pad = int(min(TARGET_W, TARGET_H) * PAD_RATIO)
    scale = min((TARGET_W - 2 * pad) / tw, (TARGET_H - 2 * pad) / th)
    nw, nh = max(1, int(tw * scale)), max(1, int(th * scale))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 0))
    canvas.paste(resized, ((TARGET_W - nw) // 2, (TARGET_H - nh) // 2), resized)
    return canvas


def main() -> None:
    src = Image.open(SRC).convert("RGB")
    # Mild upscale for cleaner edges
    src = src.resize((src.width * 2, src.height * 2), Image.Resampling.LANCZOS)
    cut = white_key(src)
    fitted = fit_equal_pad(cut)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    fitted.save(OUT, "WEBP", quality=92, method=6)

    # QA pink composite
    a = np.asarray(fitted)
    bg = np.full_like(a, [255, 20, 147, 255])
    m = a[:, :, 3:4] / 255.0
    comp = (a.astype(float) * m + bg.astype(float) * (1 - m)).astype(np.uint8)
    QA.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(comp, "RGBA").convert("RGB").save(QA)

    alpha = a[:, :, 3]
    ys = np.where(np.any(alpha > 20, axis=1))[0]
    xs = np.where(np.any(alpha > 20, axis=0))[0]
    y0, y1 = int(ys.min()), int(ys.max())
    x0, x1 = int(xs.min()), int(xs.max())
    h, w = alpha.shape
    print(
        "saved",
        OUT,
        "content",
        (x0, y0, x1, y1),
        "margins T/B/L/R",
        y0,
        h - 1 - y1,
        x0,
        w - 1 - x1,
    )


if __name__ == "__main__":
    main()
