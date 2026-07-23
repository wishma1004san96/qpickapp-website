/**
 * Generate app/ favicon assets from the official Q Pick logo.
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

async function pngBuffer(size) {
  return sharp(src)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

/** ICO container with embedded PNG images (Windows Vista+). */
function pngsToIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const parts = [Buffer.alloc(headerSize)];

  parts[0].writeUInt16LE(0, 0);
  parts[0].writeUInt16LE(1, 2);
  parts[0].writeUInt16LE(count, 4);

  pngBuffers.forEach((png, index) => {
    const size = png.length >= 24 ? png.readUInt32BE(16) : 0;
    const entryOffset = 6 + index * 16;
    parts[0].writeUInt8(size >= 256 ? 0 : size, entryOffset);
    parts[0].writeUInt8(size >= 256 ? 0 : size, entryOffset + 1);
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
    pngBuffer(16),
    pngBuffer(32),
    pngBuffer(180),
  ]);

  writeFileSync(join(appDir, "icon.png"), icon32);
  writeFileSync(join(appDir, "apple-icon.png"), apple180);
  writeFileSync(join(appDir, "favicon.ico"), pngsToIco([icon16, icon32]));

  console.log("Generated app/favicon.ico, app/icon.png, app/apple-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
