"""Compare isnet vs birefnet vs edge-enclose on sedan."""
from pathlib import Path
from io import BytesIO
import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage
import cv2

SRC = Path(
    r"C:\Users\User\.cursor\projects\d-quickpickapp\assets"
    r"\c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images"
    r"_ChatGPT_Image_Jul_19__2026__01_55_41_AM-2a3556b1-4a8c-4912-ab52-e9f4a3079862.png"
)
WORK = Path(r"D:\quickpickapp\.tmp-vehicle-extract")
box = (0.788, 0.172, 0.945, 0.338)
src = Image.open(SRC).convert("RGB")
w, h = src.size
crop = src.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
up = crop.resize((crop.size[0] * 4, crop.size[1] * 4), Image.Resampling.LANCZOS)
rgb = np.asarray(up, dtype=np.uint8)


def rembg_a(session_name: str) -> np.ndarray:
    session = new_session(session_name)
    buf = BytesIO()
    up.save(buf, format="PNG")
    out = Image.open(BytesIO(remove(buf.getvalue(), session=session))).convert("RGBA")
    return np.asarray(out.split()[-1])


def edge_enclose() -> np.ndarray:
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, 40, 120)
    edges = cv2.dilate(edges, np.ones((3, 3), np.uint8), iterations=2)
    # walls block flood
    walk = edges == 0
    seed = np.zeros(gray.shape, dtype=bool)
    seed[0, :] = seed[-1, :] = True
    seed[:, 0] = seed[:, -1] = True
    exterior = ndimage.binary_propagation(seed & walk, mask=walk)
    interior = ~exterior
    # remove tiny bits; keep largest
    labeled, n = ndimage.label(interior)
    if n:
        sizes = ndimage.sum(interior, labeled, range(1, n + 1))
        interior = labeled == (int(np.argmax(sizes)) + 1)
    return interior


def save_qa(name: str, m: np.ndarray) -> None:
    if m.dtype != np.bool_:
        m = m > 128
    alpha = (m.astype(np.uint8) * 255)
    out = Image.merge("RGBA", (*up.split(), Image.fromarray(alpha)))
    bb = Image.fromarray(alpha).getbbox()
    t = out.crop(bb)
    canvas = Image.new("RGBA", (1200, 720), (0, 0, 0, 0))
    tw, th = t.size
    scale = min(1100 / tw, 650 / th)
    nw, nh = max(1, int(tw * scale)), max(1, int(th * scale))
    t2 = t.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(t2, ((1200 - nw) // 2, (720 - nh) // 2), t2)
    qa = Image.new("RGB", (1200, 720))
    px = qa.load()
    for y in range(720):
        for x in range(1200):
            px[x, y] = (255, 255, 255) if ((x // 24) + (y // 24)) % 2 == 0 else (200, 200, 200)
    qa.paste(canvas, (0, 0), canvas)
    qa.save(WORK / f"_cmp-{name}.png")
    print(name, "coverage", float(m.mean()))


print("running isnet...")
a1 = rembg_a("isnet-general-use")
save_qa("isnet", a1 > 40)

print("running birefnet...")
a2 = rembg_a("birefnet-general")
save_qa("birefnet", a2 > 40)
save_qa("birefnet-fill", ndimage.binary_fill_holes(a2 > 40))

print("running edge...")
e = edge_enclose()
save_qa("edge", e)

# union birefnet + edge interior dilated rembg
union = (a2 > 40) | e
union = ndimage.binary_fill_holes(union)
save_qa("union", union)
print("done")
