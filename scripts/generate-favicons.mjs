/**
 * Generate favicon assets from the official Q Pick logo.
 * Source: public/logos/qpick-logo.webp (same asset as homepage branding).
 *
 * Run: node scripts/generate-favicons.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const src = join(root, "public/logos/qpick-logo.webp");
const appDir = join(root, "app");
const publicDir = join(root, "public");

/** Official brand blue — matches lib/tokens.ts */
const BRAND_BLUE = { r: 0, g: 98, b: 250, alpha: 1 };

/** Crop to the Q + pin mark (drop "PICK" text) so tab icons stay legible at 16–32px. */
async function tabIconPng(size) {
  const meta = await sharp(src).metadata();
  const cropHeight = Math.round(meta.height * 0.62);
  return sharp(src)
    .extract({
      left: 0,
      top: 0,
      width: meta.width,
      height: cropHeight,
    })
    .resize(size, size, {
      fit: "contain",
      background: BRAND_BLUE,
    })
    .png()
    .toBuffer();
}

async function appleIconPng() {
  return sharp(src)
    .resize(180, 180, {
      fit: "contain",
      background: BRAND_BLUE,
    })
    .png()
    .toBuffer();
}

/** ICO container with embedded PNG images (Windows Vista+). */
function pngsToIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const parts = [Buffer.alloc(headerSize)];

  parts[0].writeUInt16LE(0, 0);
  parts[0].writeUInt16LE(1, 2);
  parts[0].writeUInt16LE(count, 4);

  pngBuffers.forEach((png, index) => {
    const dim = sizes[index];
    const entryOffset = 6 + index * 16;
    parts[0].writeUInt8(dim >= 256 ? 0 : dim, entryOffset);
    parts[0].writeUInt8(dim >= 256 ? 0 : dim, entryOffset + 1);
    parts[0].writeUInt8(0, entryOffset + 2);
    parts[0].writeUInt8(0, entryOffset + 3);
    parts[0].writeUInt16LE(1, entryOffset + 4);
    parts[0].writeUInt16LE(32, entryOffset + 6);
    parts[0].writeUInt32LE(png.length, entryOffset + 8);
    parts[0].writeUInt32LE(offset, entryOffset + 12);
    parts.push(png);
    offset += png.length;
  });

  return Buffer.concat(parts);
}

async function main() {
  const [icon16, icon32, apple180] = await Promise.all([
    tabIconPng(16),
    tabIconPng(32),
    appleIconPng(),
  ]);

  const faviconIco = pngsToIco([icon16, icon32], [16, 32]);

  writeFileSync(join(appDir, "icon.png"), icon32);
  writeFileSync(join(appDir, "apple-icon.png"), apple180);
  writeFileSync(join(appDir, "favicon.ico"), faviconIco);
  writeFileSync(join(publicDir, "favicon.ico"), faviconIco);

  console.log(
    "Generated app/favicon.ico, app/icon.png, app/apple-icon.png, public/favicon.ico",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
