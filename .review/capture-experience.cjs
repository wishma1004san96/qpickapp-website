const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const OUT = path.join("D:", "quickpickapp", ".review");
const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function captureExperience(page, name) {
  const heading = await page.$("#experience-qpick-heading");
  if (!heading) throw new Error("Experience heading not found");
  const sectionHandle = await heading.evaluateHandle((el) =>
    el.closest("section"),
  );
  const section = sectionHandle.asElement();
  if (!section) throw new Error("Experience section not found");

  await page.evaluate(() => {
    const heading = document.querySelector("#experience-qpick-heading");
    const section = heading?.closest("section");
    const header = document.querySelector("header");
    if (header) header.style.visibility = "hidden";
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - 12));
  });
  await new Promise((r) => setTimeout(r, 500));
  await section.screenshot({ path: path.join(OUT, name) });
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

  // Prefer reduced motion off so carousel advances to destination
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);

  await page.goto("http://localhost:3000/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector("#experience-qpick-heading", { timeout: 30000 });

  // Wait until third screen (~5s): login → home → destination
  await new Promise((r) => setTimeout(r, 5600));
  await captureExperience(page, "20-experience-desktop.png");

  // Mobile
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector("#experience-qpick-heading", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 5600));
  await captureExperience(page, "21-experience-mobile.png");

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
