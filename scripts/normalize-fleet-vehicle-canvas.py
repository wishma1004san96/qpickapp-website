"""
Re-normalize fleet vehicle WebPs with generous equal padding
so long vehicles (Wagon R, vans, buses) never appear cropped in cards.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

DIR = Path(r"D:\quickpickapp\public\images\fleet\vehicles")
TARGET_W, TARGET_H = 1200, 720

# Default catalog padding (~18% of short side each side)
DEFAULT_PAD = 0.18

# Extra room for long / tall fleet icons that were clipping in the UI
PAD_BY_FILE: dict[str, float] = {
    "wagon-r.webp": 0.2,
    "flat-roof-van.webp": 0.22,
    "high-roof-van.webp": 0.22,
    "mini-bus.webp": 0.22,
    "bus.webp": 0.22,
    "mini.webp": 0.18,
    "fr-van.webp": 0.22,
}

FILES = [
    "bike.webp",
    "tuk.webp",
    "mini.webp",
    "wagon-r.webp",
    "sedan.webp",
    "minivan.webp",
    "flat-roof-van.webp",
    "high-roof-van.webp",
    "suv.webp",
    "mini-bus.webp",
    "bus.webp",
]


def alpha_bbox(im: Image.Image, threshold: int = 8):
    a = im.split()[-1]
    return a.point(lambda v: 255 if v > threshold else 0).getbbox()


def normalize(path: Path, pad_ratio: float) -> None:
    im = Image.open(path).convert("RGBA")
    bb = alpha_bbox(im)
    if not bb:
        print("skip empty", path.name)
        return
    trimmed = im.crop(bb)
    tw, th = trimmed.size
    pad = int(min(TARGET_W, TARGET_H) * pad_ratio)
    max_w = TARGET_W - pad * 2
    max_h = TARGET_H - pad * 2
    scale = min(max_w / tw, max_h / th)
    nw = max(1, int(round(tw * scale)))
    nh = max(1, int(round(th * scale)))
    scaled = trimmed.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 0))
    canvas.paste(scaled, ((TARGET_W - nw) // 2, (TARGET_H - nh) // 2), scaled)
    canvas.save(path, "WEBP", quality=95, method=6)
    fill_w = nw / TARGET_W
    fill_h = nh / TARGET_H
    print(
        f"{path.name}: pad={pad_ratio:.0%} content {nw}x{nh} "
        f"fillW={fill_w:.2f} fillH={fill_h:.2f}"
    )


def main() -> None:
    for name in FILES:
        path = DIR / name
        if not path.exists():
            print("missing", name)
            continue
        normalize(path, PAD_BY_FILE.get(name, DEFAULT_PAD))


if __name__ == "__main__":
    main()
