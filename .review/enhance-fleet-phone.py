"""Enhance Fleet phone WebP in-place: sharpness, contrast, edges; preserve alpha & size."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps

SRC = Path(r"D:\quickpickapp\public\images\fleet\qpick-fleet-phone.webp")
BACKUP = Path(r"D:\quickpickapp\.review\qpick-fleet-phone-pre-enhance.webp")
OUT = SRC


def enhance_rgb(rgb: Image.Image) -> Image.Image:
    # Mild artifact soften (codec blocks) — very light
    soft = rgb.filter(ImageFilter.GaussianBlur(radius=0.4))
    base = Image.blend(rgb, soft, 0.22)

    base = ImageEnhance.Contrast(base).enhance(1.11)
    base = ImageEnhance.Color(base).enhance(1.04)
    base = ImageEnhance.Brightness(base).enhance(1.01)

    # Structure / metal + UI card edges
    struct = base.filter(
        ImageFilter.UnsharpMask(radius=1.25, percent=140, threshold=5)
    )
    # Screen text micro-clarity (small radius = less halo)
    text = struct.filter(
        ImageFilter.UnsharpMask(radius=0.65, percent=95, threshold=2)
    )
    # Local detail without aggressive halo
    detail = text.filter(ImageFilter.DETAIL)
    # Keep most of text pass; only a touch of DETAIL
    out = Image.blend(text, detail, 0.35)
    return out


def main() -> None:
    # Always refine from original backup so passes don't stack
    source = BACKUP if BACKUP.exists() else SRC
    im = Image.open(source).convert("RGBA")
    w, h = im.size
    alpha = im.getchannel("A")
    rgb = im.convert("RGB")

    enhanced = enhance_rgb(rgb)
    out = enhanced.convert("RGBA")
    out.putalpha(alpha)
    assert out.size == (w, h)

    if not BACKUP.exists():
        BACKUP.write_bytes(SRC.read_bytes())

    out.save(OUT, format="WEBP", quality=100, method=6, exact=True)

    verify = Image.open(OUT).convert("RGBA")
    print("source", source)
    print("wrote", OUT)
    print("size", verify.size)
    print("bytes", OUT.stat().st_size)
    print("alpha extrema", verify.getchannel("A").getextrema())
    print(
        "alpha identical",
        list(verify.getchannel("A").getdata()) == list(alpha.getdata()),
    )


if __name__ == "__main__":
    main()
