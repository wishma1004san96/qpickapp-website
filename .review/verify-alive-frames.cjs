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
  await page.goto("http://localhost:3000/?alive2=" + Date.now(), {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector("#experience-qpick-heading");
  await page.evaluate(() => {
    const header = document.querySelector("header");
    if (header) header.style.visibility = "hidden";
    const section = document
      .querySelector("#experience-qpick-heading")
      ?.closest("section");
    if (section) {
      window.scrollTo(
        0,
        section.getBoundingClientRect().top + window.scrollY - 8,
      );
    }
  });

  const shot = async (name) => {
    const heading = await page.$("#experience-qpick-heading");
    const sectionHandle = await heading.evaluateHandle((el) =>
      el.closest("section"),
    );
    await sectionHandle.asElement().screenshot({
      path: path.join(OUT, name),
    });
    console.log("wrote", name);
  };

  await new Promise((r) => setTimeout(r, 900));
  await shot("23-experience-alive-desktop.png");
  await new Promise((r) => setTimeout(r, 2300));
  await shot("24-experience-alive-pulse.png");

  const audit = await page.evaluate(() => {
    const pulse = document.querySelector(".experience-ambient-path-pulse");
    return {
      glow: getComputedStyle(document.querySelector(".experience-ambient-glow"))
        .opacity,
      route: getComputedStyle(
        document.querySelector(".experience-ambient-route"),
      ).opacity,
      pins: getComputedStyle(document.querySelector(".experience-ambient-pins"))
        .opacity,
      particles: document.querySelectorAll(".experience-ambient-particle")
        .length,
      dashOffset: pulse ? getComputedStyle(pulse).strokeDashoffset : null,
    };
  });
  console.log(JSON.stringify(audit, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
