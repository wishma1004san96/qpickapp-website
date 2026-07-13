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

  await page.goto("http://localhost:3000/?v=" + Date.now(), {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector("#experience-qpick-heading", { timeout: 30000 });

  // Freeze on first screen and pause float for a clean proof shot
  await page.evaluate(() => {
    const heading = document.querySelector("#experience-qpick-heading");
    const section = heading?.closest("section");
    const header = document.querySelector("header");
    if (header) header.style.visibility = "hidden";
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(0, top - 12));
    }
    document.querySelectorAll(".experience-phone-float").forEach((el) => {
      el.style.animation = "none";
    });
  });
  await new Promise((r) => setTimeout(r, 400));

  const audit = await page.evaluate(() => {
    const display = document.querySelector(".experience-phone-display");
    const screens = [...document.querySelectorAll(".experience-phone-screen")];
    const shots = [...document.querySelectorAll(".experience-phone-shot")];
    const glow = document.querySelector(".experience-ambient-glow");
    const route = document.querySelector(".experience-ambient-route");
    const pins = document.querySelector(".experience-ambient-pins");
    const path = document.querySelector(".experience-ambient-path");

    const cs = (el) => (el ? getComputedStyle(el) : null);
    const d = cs(display);
    const g = cs(glow);
    const r = cs(route);
    const p = cs(pins);

    return {
      displayBg: d?.backgroundColor,
      displayIsolation: d?.isolation,
      screenCount: screens.length,
      visibleScreens: screens.filter((s) => getComputedStyle(s).opacity !== "0")
        .length,
      screenBgs: screens.slice(0, 2).map((s) => getComputedStyle(s).backgroundColor),
      shotFilters: shots.slice(0, 1).map((s) => getComputedStyle(s).filter),
      shotOpacity: shots.slice(0, 1).map((s) => getComputedStyle(s).opacity),
      glowOpacity: g?.opacity,
      routeOpacity: r?.opacity,
      pinsOpacity: p?.opacity,
      pathDash: path ? getComputedStyle(path).strokeDashoffset : null,
      routeBox: route?.getBoundingClientRect().toJSON(),
      pinsBox: pins?.getBoundingClientRect().toJSON(),
      glowBox: glow?.getBoundingClientRect().toJSON(),
    };
  });

  console.log("AUDIT", JSON.stringify(audit, null, 2));

  const heading = await page.$("#experience-qpick-heading");
  const sectionHandle = await heading.evaluateHandle((el) =>
    el.closest("section"),
  );
  const section = sectionHandle.asElement();
  const outPath = path.join(OUT, "22-experience-verify-desktop.png");
  await section.screenshot({ path: outPath });
  console.log("wrote", outPath);

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
