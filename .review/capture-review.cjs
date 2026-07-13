const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const OUT = path.join("D:", "quickpickapp", ".review");
const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

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
  await page.waitForSelector("#experience-qpick-heading", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Full desktop homepage
  await page.screenshot({
    path: path.join(OUT, "10-desktop-full.png"),
    fullPage: true,
  });
  console.log("10-desktop-full.png");

  // 3. Hero section
  const hero = await page.$('section[aria-label="Q Pick introduction"]');
  if (hero) {
    await hero.screenshot({ path: path.join(OUT, "12-hero.png") });
    console.log("12-hero.png");
  }

  // 4. Experience Q Pick
  const experience = await page.$("#experience-qpick-heading");
  if (experience) {
    const section = await experience.evaluateHandle((el) =>
      el.closest("section"),
    );
    const el = section.asElement();
    if (el) {
      await el.screenshot({ path: path.join(OUT, "13-experience-qpick.png") });
      console.log("13-experience-qpick.png");
    }
  }

  // 5. Transition Hero → Experience → Journey Story (viewport band)
  await page.evaluate(() => {
    const hero = document.querySelector(
      'section[aria-label="Q Pick introduction"]',
    );
    if (!hero) return;
    const y = hero.offsetHeight - 180;
    window.scrollTo(0, Math.max(0, y));
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(OUT, "14-transition-hero-experience.png"),
    fullPage: false,
  });
  console.log("14-transition-hero-experience.png");

  await page.evaluate(() => {
    const heading = document.querySelector("#experience-qpick-heading");
    const section = heading?.closest("section");
    if (!section) return;
    const y =
      section.offsetTop + section.offsetHeight - window.innerHeight * 0.35;
    window.scrollTo(0, Math.max(0, y));
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(OUT, "15-transition-experience-story.png"),
    fullPage: false,
  });
  console.log("15-transition-experience-story.png");

  // 2. Full mobile homepage
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector("#experience-qpick-heading", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({
    path: path.join(OUT, "11-mobile-full.png"),
    fullPage: true,
  });
  console.log("11-mobile-full.png");

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
