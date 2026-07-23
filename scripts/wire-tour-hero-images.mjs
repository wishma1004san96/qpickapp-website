/**
 * Convert premium tour hero assets to WebP and write to public/images/tours/.
 * Run: node scripts/wire-tour-hero-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.join(
  process.env.USERPROFILE ?? "",
  ".cursor/projects/d-quickpickapp/assets",
);
const outDir = path.join(root, "public/images/tours");

const TOUR_HERO_FILES = [
  {
    out: "gal-vihara-polonnaruwa.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_GAL_VIHARA-49a0b3e3-85f8-4d40-906b-d3d3f5eb7001.png",
  },
  {
    out: "sri-maha-bodhi-anuradhapura.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Sri-Maha-Bodiya-ab638baa-7941-4298-95f5-f9e4dba57cfb.png",
  },
  {
    out: "pidurangala-sigiriya.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Pidurangala_Rock-7b161cb4-4999-402d-a615-42add9060c46.png",
  },
  {
    out: "ella-rock-viewpoint.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Ella_Rock-89e5b133-d444-4e5e-9d13-774773ab83e5.png",
  },
  {
    out: "nine-arches-bridge-ella.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Nine_Arches_Bridge-6ddbd4c8-2183-4d7e-a21f-7ec70fa66e4f.png",
  },
  {
    out: "ayurveda-wellness-treatment.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_treat2-2564554b-ea9e-4bca-a1be-8a75a6b420ea.png",
  },
  {
    out: "mirissa-southern-coast.webp",
    asset: null,
    input: path.join(root, "public/images/destinations/Mirissa Beach.webp"),
  },
  {
    out: "jaffna-fort-aerial.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_jaffna-5863bd94-6c17-4ec1-8a6a-cfe350bc3120.png",
  },
  {
    out: "temple-of-the-tooth-kandy.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Temple-of-the-Tooth-_Kandy_-ddc549f6-3604-4f10-9e29-b5623d411ed7.png",
  },
  {
    out: "yala-leopard-safari.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Yala_National_Park-76c59dee-877a-4f6b-b0dd-44f01f631afe.png",
  },
  {
    out: "galle-fort-lighthouse.webp",
    asset: null,
    input: path.join(root, "public/images/destinations/Galle Fort Lighthouse.webp"),
  },
  {
    out: "bentota-luxury-coast.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_bentota-beach-c437c18c-f78b-40a4-afb2-c75179cb9798.png",
  },
  {
    out: "liptons-seat-tea-country.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Lipton_s_Seat-6ab4bef4-2a0c-475c-8508-fd356c95d1a5.png",
  },
  {
    out: "colombo-lotus-tower.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_colombo-2c1a1bdd-43d8-4b39-a4ef-b02730309891.png",
  },
  {
    out: "sigiriya-rock-fortress.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Sigiriya-Rock-Fortress-8f0885ca-c504-4328-9a78-adecc5272028.png",
  },
  {
    out: "anuradhapura-sacred-city.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_anuradhapura-3323a6b3-ba42-4dc7-825f-109a1f8526a7.png",
  },
  {
    out: "dambulla-cave-temple.webp",
    asset: "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_dambulla-cave-temple-79fbb480-00c3-4615-9497-7fc99b15123a.png",
  },
  {
    out: "delft-island-coral-beach.webp",
    asset: null,
    input: path.join(root, "public/images/destinations/Delft Island.webp"),
  },
  {
    out: "nainativu-sacred-island.webp",
    asset: null,
    input: path.join(
      root,
      "public/images/destinations/Nainativu Nagadeepa Temple.webp",
    ),
  },
];

fs.mkdirSync(outDir, { recursive: true });

for (const { out, asset, input: inputPath } of TOUR_HERO_FILES) {
  const input = inputPath ?? path.join(assetsDir, asset);
  const output = path.join(outDir, out);
  if (!fs.existsSync(input)) {
    console.error(`Missing input: ${input}`);
    process.exit(1);
  }
  await sharp(input)
    .rotate()
    .resize(1600, 1000, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toFile(output);
  console.log(`✓ ${out}`);
}

console.log(`\nWrote ${TOUR_HERO_FILES.length} tour hero images to public/images/tours/`);
