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
  await page.setCacheEnabled(false);
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);

  await page.goto("http://localhost:3000/?alive=" + Date.now(), {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector("#experience-qpick-heading", { timeout: 30000 });

  await page.evaluate(() => {
    const heading = document.querySelector("#experience-qpick-heading");
    const section = heading?.closest("section");
    const header = document.querySelector("header");
    if (header) header.style.visibility = "hidden";
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(0, top - 8));
    }
  });

  // Let animations progress so pulse/particles are mid-cycle
  await new Promise((r) => setTimeout(r, 1800));

  const audit = await page.evaluate(() => {
    const glow = getComputedStyle(
      document.querySelector(".experience-ambient-glow"),
    );
    const route = getComputedStyle(
      document.querySelector(".experience-ambient-route"),
    );
    const pins = getComputedStyle(
      document.querySelector(".experience-ambient-pins"),
    );
    const particles = document.querySelectorAll(
      ".experience-ambient-particle",
    ).length;
    const pulse = document.querySelector(".experience-ambient-path-pulse");
    return {
      glowOpacity: glow.opacity,
      routeOpacity: route.opacity,
      pinsOpacity: pins.opacity,
      particles,
      pulseDash: pulse ? getComputedStyle(pulse).strokeDasharray : null,
    };
  });
  console.log("AUDIT", JSON.stringify(audit, null, 2));

  const heading = await page.$("#experience-qpick-heading");
  const sectionHandle = await heading.evaluateHandle((el) =>
    el.closest("section"),
  );
  const section = sectionHandle.asElement();
  const out = path.join(OUT, "23-experience-alive-desktop.png");
  await section.screenshot({ path: out });
  console.log("wrote", out);
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
