"""Remove solid blue studio / see-through fill; preserve phone + screen UI."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

SRC = Path(
    r"C:\Users\User\.cursor\projects\d-quickpickapp\assets"
    r"\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images"
    r"_Screenshot_2026-07-14_204733-64c7ad3d-5118-4038-ae34-002e2eb12503.png"
)
OUT_DIR = Path(r"D:\quickpickapp\public\images\fleet")
OUT = OUT_DIR / "qpick-fleet-phone.webp"


def dist2(a: tuple[float, float, float], b: tuple[float, float, float]) -> float:
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2


def is_field_blue(r: float, g: float, b: float) -> bool:
    """Flat Q Pick blue field (exterior bg or see-through fill)."""
    if b < 215:
        return False
    if r > 60:
        return False
    if g > 145:
        return False
    if b < r + 110:
        return False
    if b < g + 90:
        return False
    return True


def is_ui_light(r: int, g: int, b: int) -> bool:
    return r > 190 and g > 190 and b > 190


def is_phone_metal(r: int, g: int, b: int) -> bool:
    lum = r + g + b
    if lum > 280:
        return False
    # near-neutral / cool dark without dominant pure blue field
    if b > 200 and r < 40:
        return False
    return abs(r - g) < 45 and abs(g - b) < 55


def flood_from_border(mask: list[list[bool]]) -> list[list[bool]]:
    h = len(mask)
    w = len(mask[0])
    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    def push(y: int, x: int) -> None:
        if 0 <= y < h and 0 <= x < w and mask[y][x] and not visited[y][x]:
            visited[y][x] = True
            q.append((y, x))

    for x in range(w):
        push(0, x)
        push(h - 1, x)
    for y in range(h):
        push(y, 0)
        push(y, w - 1)

    while q:
        y, x = q.popleft()
        push(y - 1, x)
        push(y + 1, x)
        push(y, x - 1)
        push(y, x + 1)

    return visited


def near_protected(
    px, x: int, y: int, w: int, h: int, rad: int = 2
) -> bool:
    for dy in range(-rad, rad + 1):
        for dx in range(-rad, rad + 1):
            xx, yy = x + dx, y + dy
            if 0 <= xx < w and 0 <= yy < h:
                r, g, b, _a = px[xx, yy]
                if is_ui_light(r, g, b) or is_phone_metal(r, g, b):
                    return True
    return False


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    px = im.load()

    corner_samples: list[tuple[int, int, int]] = []
    for x0, y0, x1, y1 in (
        (0, 0, 10, 10),
        (w - 10, 0, w, 10),
        (0, h - 10, 10, h),
        (w - 10, h - 10, w, h),
    ):
        for y in range(y0, y1):
            for x in range(x0, x1):
                r, g, b, _a = px[x, y]
                corner_samples.append((r, g, b))

    rs = sorted(s[0] for s in corner_samples)
    gs = sorted(s[1] for s in corner_samples)
    bs = sorted(s[2] for s in corner_samples)
    m = len(corner_samples) // 2
    key = (float(rs[m]), float(gs[m]), float(bs[m]))
    print("key_rgb", key, "size", w, h)

    candidate = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if is_field_blue(float(r), float(g), float(b)):
                candidate[y][x] = True

    exterior = flood_from_border(candidate)

    out = Image.new("RGBA", (w, h))
    out_px = out.load()
    opaque = 0
    transparent = 0

    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            rf, gf, bf = float(r), float(g), float(b)
            field = is_field_blue(rf, gf, bf)
            d = dist2((rf, gf, bf), key) ** 0.5

            remove = False
            soft = False

            if field and exterior[y][x]:
                remove = True
                soft = d > 26
            elif field and d < 38 and not near_protected(px, x, y, w, h, 2):
                # See-through blue inside the display (not UI / metal)
                remove = True
                soft = False

            if not remove:
                out_px[x, y] = (r, g, b, 255)
                opaque += 1
                continue

            if not soft or d < 26:
                out_px[x, y] = (0, 0, 0, 0)
                transparent += 1
                continue

            a = max(0.0, min(1.0, (d - 26.0) / 36.0))
            alpha = int(round(a * 255))
            if alpha < 2:
                out_px[x, y] = (0, 0, 0, 0)
                transparent += 1
                continue

            # Despill residual blue on fringe
            spill = max(0.0, min(1.0, (bf - max(rf, gf)) / 120.0))
            target = (rf + gf) * 0.5
            mix = 0.8 * spill
            rr = int(round(rf * (1 - mix) + target * mix))
            gg = int(round(gf * (1 - mix) + target * mix))
            bb = int(round(bf * (1 - mix) + target * mix))
            out_px[x, y] = (
                max(0, min(255, rr)),
                max(0, min(255, gg)),
                max(0, min(255, bb)),
                alpha,
            )
            if alpha > 128:
                opaque += 1
            else:
                transparent += 1

    assert out.size == (w, h)
    out.save(OUT, format="WEBP", quality=96, method=6)
    print("wrote", OUT)
    print("bytes", OUT.stat().st_size, "opaque", opaque, "transparent", transparent)


if __name__ == "__main__":
    main()
