"""Quick A/B test: fill_holes vs filled outer contour for sedan."""
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
box = (0.788, 0.172, 0.945, 0.338)  # sedan
src = Image.open(SRC).convert("RGB")
w, h = src.size
crop = src.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
up = crop.resize((crop.size[0] * 4, crop.size[1] * 4), Image.Resampling.LANCZOS)
session = new_session("isnet-general-use")
buf = BytesIO()
up.save(buf, format="PNG")
rem = Image.open(BytesIO(remove(buf.getvalue(), session=session))).convert("RGBA")
a = np.asarray(rem.split()[-1])
fg = a > 40
fg2 = ndimage.binary_fill_holes(fg)
print("before", float(fg.mean()), "after fill_holes", float(fg2.mean()))

bin8 = (fg.astype(np.uint8)) * 255
cnts, _ = cv2.findContours(bin8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
largest = max(cnts, key=cv2.contourArea)
mask = np.zeros_like(bin8)
cv2.drawContours(mask, [largest], -1, 255, thickness=cv2.FILLED)
# also close then contour
fg3 = ndimage.binary_closing(fg, structure=np.ones((21, 21)))
fg3 = ndimage.binary_fill_holes(fg3)
bin8b = (fg3.astype(np.uint8)) * 255
cnts2, _ = cv2.findContours(bin8b, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
largest2 = max(cnts2, key=cv2.contourArea)
mask2 = np.zeros_like(bin8b)
cv2.drawContours(mask2, [largest2], -1, 255, thickness=cv2.FILLED)
print("contour", float((mask > 0).mean()), "close+contour", float((mask2 > 0).mean()))


def save_qa(name: str, m: np.ndarray) -> None:
    alpha = (m.astype(np.uint8) * 255)
    out = Image.merge("RGBA", (*up.split(), Image.fromarray(alpha)))
    bb = Image.fromarray(alpha).getbbox()
    t = out.crop(bb)
    canvas = Image.new("RGBA", (1200, 720), (0, 0, 0, 0))
    tw, th = t.size
    scale = min(1100 / tw, 650 / th)
    nw, nh = int(tw * scale), int(th * scale)
    t2 = t.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(t2, ((1200 - nw) // 2, (720 - nh) // 2), t2)
    qa = Image.new("RGB", (1200, 720))
    px = qa.load()
    for y in range(720):
        for x in range(1200):
            px[x, y] = (255, 255, 255) if ((x // 24) + (y // 24)) % 2 == 0 else (200, 200, 200)
    qa.paste(canvas, (0, 0), canvas)
    qa.save(WORK / f"_test-{name}-sedan.png")


save_qa("fill", fg2)
save_qa("contour", mask > 0)
save_qa("close-contour", mask2 > 0)
# raw rembg alpha soft
save_qa("raw-rembg", a > 128)
print("saved")
