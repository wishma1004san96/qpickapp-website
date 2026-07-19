from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path(r"D:\quickpickapp\.tmp-vehicle-extract")
OUT.mkdir(exist_ok=True)
ROOT = Path(r"D:\quickpickapp\public\images\fleet\vehicles")

for name in ["flat-roof-van.webp", "high-roof-van.webp"]:
    im = Image.open(ROOT / name).convert("RGBA")
    a = np.asarray(im)
    alpha = a[:, :, 3]
    bg = np.full_like(a, [255, 20, 147, 255])
    m = alpha[..., None] / 255.0
    comp = (a.astype(float) * m + bg.astype(float) * (1 - m)).astype(np.uint8)
    stem = name.replace(".webp", "")
    Image.fromarray(comp, "RGBA").convert("RGB").save(OUT / f"_{stem}-pink.png")

    rows = np.any(alpha > 20, axis=1)
    cols = np.any(alpha > 20, axis=0)
    ys = np.where(rows)[0]
    xs = np.where(cols)[0]
    y0, y1 = int(ys.min()), int(ys.max())
    x0, x1 = int(xs.min()), int(xs.max())
    bot = im.crop((x0, max(y0, y1 - 180), x1, min(im.height, y1 + 40)))
    arr = np.asarray(bot)
    abg = np.full_like(arr, [255, 255, 255, 255])
    m2 = arr[:, :, 3:4] / 255.0
    comp2 = (arr.astype(float) * m2 + abg.astype(float) * (1 - m2)).astype(np.uint8)
    Image.fromarray(comp2, "RGBA").convert("RGB").save(OUT / f"_{stem}-bottom.png")
    print("saved", stem, "bbox", x0, y0, x1, y1)
