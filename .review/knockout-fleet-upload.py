"""Knock out flat white studio background; keep phone + soft shadow."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

SRC = Path(r"D:\quickpickapp\public\images\fleet\qpick-fleet-phone(1).webp")
OUT = Path(r"D:\quickpickapp\public\images\fleet\qpick-fleet-phone-upload.webp")


def is_bg(r: int, g: int, b: int) -> bool:
    """Near-white / light-gray studio field."""
    if abs(r - g) > 12 or abs(g - b) > 12:
        return False
    return min(r, g, b) >= 228


def flood_bg(mask: list[list[bool]]) -> list[list[bool]]:
    h, w = len(mask), len(mask[0])
    seen = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    def push(y: int, x: int) -> None:
        if 0 <= y < h and 0 <= x < w and mask[y][x] and not seen[y][x]:
            seen[y][x] = True
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
    return seen


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    w, h = im.size
    px = im.load()
    assert px is not None

    candid = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            candid[y][x] = is_bg(r, g, b)

    kill = flood_bg(candid)

    out = Image.new("RGBA", (w, h))
    opx = out.load()
    assert opx is not None

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if kill[y][x]:
                opx[x, y] = (r, g, b, 0)
                continue
            # Soften near-white fringe next to removed field
            fringe = False
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and kill[ny][nx]:
                        fringe = True
                        break
                if fringe:
                    break
            if fringe and is_bg(r, g, b):
                opx[x, y] = (r, g, b, 0)
            elif fringe and min(r, g, b) > 200:
                # partial alpha on bright fringe
                t = (min(r, g, b) - 200) / 55.0
                alpha = max(0, min(255, int(255 * (1.0 - t * 0.85))))
                opx[x, y] = (r, g, b, alpha)
            else:
                opx[x, y] = (r, g, b, a)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT, format="WEBP", quality=100, method=6, exact=True)
    verify = Image.open(OUT).convert("RGBA")
    print("wrote", OUT)
    print("size", verify.size, "bytes", OUT.stat().st_size)
    print("alpha", verify.getchannel("A").getextrema())
    print("tl", verify.getpixel((0, 0)), "c", verify.getpixel((w // 2, h // 2)))


if __name__ == "__main__":
    main()
