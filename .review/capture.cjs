const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const OUT = path.join("D:", "quickpickapp", ".review");
const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function shot(page, name, opts) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, ...opts });
  console.log("wrote", name);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    args: ["--hide-scrollbars"],
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  // wait for hero image
  await page.waitForSelector('img[alt*="Sigiriya"]', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));

  // Desktop full
  await shot(page, "01-desktop.png", { fullPage: false });

  // Nav close-up
  const header = await page.$("header");
  if (header) {
    await header.screenshot({ path: path.join(OUT, "03-nav-closeup.png") });
    console.log("wrote 03-nav-closeup.png");
  }

  // Hero close-up (section)
  const hero = await page.$('section[aria-label="Q Pick introduction"]');
  if (hero) {
    await hero.screenshot({ path: path.join(OUT, "04-hero-closeup.png") });
    console.log("wrote 04-hero-closeup.png");
  }

  // Footer close-up
  const footer = await page.$("footer");
  if (footer) {
    await footer.scrollIntoViewIfNeeded();
    await new Promise((r) => setTimeout(r, 400));
    await footer.screenshot({ path: path.join(OUT, "05-footer-closeup.png") });
    console.log("wrote 05-footer-closeup.png");
  }

  // Mobile
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector('img[alt*="Sigiriya"]', { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));
  await shot(page, "02-mobile.png", { fullPage: false });

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
