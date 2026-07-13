const puppeteer = require("puppeteer-core");
const path = require("path");

const OUT = path.join("D:", "quickpickapp", ".review");
const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: 1440, height: 1000, deviceScaleFactor: 1 },
    args: ["--hide-scrollbars"],
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.goto("http://localhost:3000/?live=" + Date.now(), {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector(".experience-live");

  // Fast-forward carousel to live screen
  await page.evaluate(() => {
    const header = document.querySelector("header");
    if (header) header.style.visibility = "hidden";
    const section = document
      .querySelector("#experience-qpick-heading")
      ?.closest("section");
    if (section) {
      window.scrollTo(
        0,
        section.getBoundingClientRect().top + window.scrollY - 12,
      );
    }
  });

  // Wait until live screen is visible (opacity 1)
  await page.waitForFunction(
    () => {
      const live = document.querySelector(".experience-live");
      const screen = live?.closest(".experience-phone-screen");
      if (!screen) return false;
      return getComputedStyle(screen).opacity === "1";
    },
    { timeout: 20000 },
  );

  // Let route/driver animate
  await new Promise((r) => setTimeout(r, 3200));

  const audit = await page.evaluate(() => {
    const particles = document.querySelectorAll(".experience-ambient-particle");
    const vehicles = document.querySelectorAll(".experience-ambient-vehicle");
    const live = document.querySelector(".experience-live");
    const glow = document.querySelector(".experience-ambient-glow");
    const spill = document.querySelector(".experience-ambient-spill");
    const sheen = document.querySelector(".experience-dynamic-island-sheen");
    return {
      particles: particles.length,
      vehicles: vehicles.length,
      livePhase: live?.getAttribute("data-phase"),
      liveActive: live?.getAttribute("data-active"),
      glowOp: glow ? getComputedStyle(glow).opacity : null,
      spill: !!spill,
      sheen: !!sheen,
      forbiddenBgSvg: document.querySelectorAll(
        ".experience-ambient svg, .experience-ambient-route",
      ).length,
    };
  });
  console.log(JSON.stringify(audit, null, 2));

  const heading = await page.$("#experience-qpick-heading");
  const sectionHandle = await heading.evaluateHandle((el) =>
    el.closest("section"),
  );
  await sectionHandle.asElement().screenshot({
    path: path.join(OUT, "28-experience-phone-hero.png"),
  });
  console.log("wrote 28-experience-phone-hero.png");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
