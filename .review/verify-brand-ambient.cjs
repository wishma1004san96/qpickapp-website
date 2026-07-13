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
  await page.goto("http://localhost:3000/?brand=" + Date.now(), {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector(".experience-ambient");
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
  await new Promise((r) => setTimeout(r, 1500));

  const audit = await page.evaluate(() => {
    const ambient = document.querySelector(".experience-ambient");
    const vehicles = document.querySelectorAll(".experience-ambient-vehicle");
    const cards = document.querySelectorAll(".experience-ambient-card");
    const streaks = document.querySelectorAll(".experience-ambient-streak");
    const glass = document.querySelectorAll(".experience-ambient-glass");
    return {
      ambientWidth: getComputedStyle(ambient).width,
      vehicles: vehicles.length,
      cards: cards.length,
      streaks: streaks.length,
      glass: glass.length,
      glowExists: !!document.querySelector(".experience-ambient-glow"),
      leftClean: !document.querySelector(".experience-copy .experience-ambient"),
    };
  });
  console.log(JSON.stringify(audit, null, 2));

  const heading = await page.$("#experience-qpick-heading");
  const sectionHandle = await heading.evaluateHandle((el) =>
    el.closest("section"),
  );
  await sectionHandle.asElement().screenshot({
    path: path.join(OUT, "25-experience-brand-ambient.png"),
  });
  console.log("wrote 25-experience-brand-ambient.png");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
