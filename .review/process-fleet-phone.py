from PIL import Image
from collections import defaultdict
from pathlib import Path

src = Path(r"C:\Users\User\.cursor\projects\d-quickpickapp\assets\fleet-phone-screen-face-source.png")
out = Path(r"D:\quickpickapp\public\images\fleet\iphone-perspective.png")

im = Image.open(src).convert("RGBA")
w, h = im.size
print("size", w, h)
pix = im.load()


def is_magenta(r, g, b, a):
    if a < 8:
        return False
    # hot magenta / pink screen
    return r > 140 and b > 120 and g < 170 and r > g + 40


rows = defaultdict(list)
for y in range(h):
    for x in range(w):
        r, g, b, a = pix[x, y]
        if is_magenta(r, g, b, a):
            rows[y].append(x)


def width(y):
    xs = rows[y]
    return max(xs) - min(xs) if xs else 0


ys = sorted(rows)
core = [y for y in ys if width(y) > 80]
print("core", len(core), core[0], "->", core[-1])
n = max(4, len(core) // 20)
top_rows = core[:n]
bot_rows = core[-n:]


def avg_lr(ylist):
    l = sum(min(rows[y]) for y in ylist) / len(ylist)
    r = sum(max(rows[y]) for y in ylist) / len(ylist)
    y = sum(ylist) / len(ylist)
    return l, r, y


tl_x, tr_x, ty = avg_lr(top_rows)
bl_x, br_x, by = avg_lr(bot_rows)
print(
    "img_pct",
    {
        "tl": (round(tl_x / w * 100, 2), round(ty / h * 100, 2)),
        "tr": (round(tr_x / w * 100, 2), round(ty / h * 100, 2)),
        "br": (round(br_x / w * 100, 2), round(by / h * 100, 2)),
        "bl": (round(bl_x / w * 100, 2), round(by / h * 100, 2)),
    },
)

bbox_l = min(tl_x, bl_x)
bbox_r = max(tr_x, br_x)
bbox_w = bbox_r - bbox_l
bbox_h = by - ty
print(
    "bbox_pct",
    {
        "left": round(bbox_l / w * 100, 2),
        "top": round(ty / h * 100, 2),
        "width": round(bbox_w / w * 100, 2),
        "height": round(bbox_h / h * 100, 2),
    },
)
print(
    "clip_rel",
    {
        "tl": (round((tl_x - bbox_l) / bbox_w * 100, 2), 0),
        "tr": (round((tr_x - bbox_l) / bbox_w * 100, 2), 0),
        "br": (round((br_x - bbox_l) / bbox_w * 100, 2), 100),
        "bl": (round((bl_x - bbox_l) / bbox_w * 100, 2), 100),
    },
)

# key magenta + soft fringe + near-white / checker bg
for y in range(h):
    for x in range(w):
        r, g, b, a = pix[x, y]
        if is_magenta(r, g, b, a):
            pix[x, y] = (0, 0, 0, 0)
            continue
        if a > 0 and r > 210 and g > 210 and b > 210:
            pix[x, y] = (0, 0, 0, 0)
            continue
        # light fringe of pink on edges
        if a > 0 and r > 120 and b > 100 and g < 180 and r > g + 25 and (r + b) > 280:
            pix[x, y] = (0, 0, 0, 0)

im.save(out, optimize=True)
print("wrote", out, out.stat().st_size)
