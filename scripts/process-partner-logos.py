from PIL import Image
import os
import shutil

ASSETS = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    ".cursor",
    "projects",
    "d-quickpickapp",
    "assets",
)
# Fallback to cursor assets path on this machine
if not os.path.isdir(ASSETS):
    ASSETS = r"C:\Users\User\.cursor\projects\d-quickpickapp\assets"

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images", "partners")
os.makedirs(OUT, exist_ok=True)

SOURCES = {
    "hnb-life.png": "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Logo-HNB-Life-PLC-2026-1024x724-008ee877-3c68-4d64-8184-95a6c46e5e70.png",
    "qpick.png": "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_qpick-logo-0af8c63b-c5bf-4d36-8354-516b6faf2d50.png",
    "stripe.png": "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_stripe-v2-972cf869-89bd-463b-903e-e0b9f7192f9c.png",
    "nv-global.png": "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_nv-global-logo-e39283b1-f32c-420a-9b91-5ce85a610c29.png",
    "linked-circles.png": "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_images__5_-ab515093-1cb0-481f-b360-08c61ac931c2.png",
    "google.png": "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_google-logo-93b7b069-6909-4819-9840-6bf83f9ff83d.png",
    "aws.png": "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_AWS-Fundamentals-333c6c9b-6b0c-4329-94f4-ccea9f124f5e.png",
}


def remove_bg(path_in: str, path_out: str, mode: str = "light", tolerance: int = 28) -> None:
    img = Image.open(path_in).convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if mode == "light" and r > 255 - tolerance and g > 255 - tolerance and b > 255 - tolerance:
                px[x, y] = (r, g, b, 0)
            elif mode == "dark" and r < tolerance and g < tolerance and b < tolerance:
                px[x, y] = (r, g, b, 0)
            elif mode == "gray" and abs(r - g) < 12 and abs(g - b) < 12 and r > 220:
                px[x, y] = (r, g, b, 0)
    img.save(path_out, optimize=True)


root = os.path.join(os.path.dirname(__file__), "..")

for name, src in SOURCES.items():
    src_path = os.path.join(ASSETS, src)
    out_path = os.path.join(OUT, name)
    if name in ("qpick.png", "stripe.png"):
        shutil.copy2(src_path, out_path)
        print(f"copied official-bg: {name}")
        continue
    mode = "dark" if name == "nv-global.png" else "gray" if name == "google.png" else "light"
    remove_bg(src_path, out_path, mode=mode)
    print(f"processed: {name}")

shutil.copy2(
    os.path.join(root, "public/images/banking/pan-asia-bank-logo.png"),
    os.path.join(OUT, "pan-asia-bank.png"),
)
shutil.copy2(
    os.path.join(root, "public/images/trust/sltda-logo.png"),
    os.path.join(OUT, "sltda.png"),
)
print("copied pan-asia + sltda from project")
