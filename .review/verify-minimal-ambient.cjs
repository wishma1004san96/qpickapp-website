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
  await page.goto("http://localhost:3000/?minimal=" + Date.now(), {
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
  await new Promise((r) => setTimeout(r, 1200));

  const audit = await page.evaluate(() => {
    const forbidden = [
      ".experience-ambient-vehicle",
      ".experience-ambient-card",
      ".experience-ambient-streak",
      ".experience-ambient-glass",
      ".experience-ambient-blob",
      ".experience-ambient-link",
      ".experience-ambient-pulse",
      "svg.experience-ambient-route",
    ];
    const stage = document.querySelector(".experience-stage");
    const glow = document.querySelector(".experience-ambient-glow");
    const volume = document.querySelector(".experience-ambient-volume");
    const particles = document.querySelectorAll(".experience-ambient-particle");
    const glass = document.querySelector(".experience-phone-glass");
    return {
      stageBg: stage ? getComputedStyle(stage).backgroundColor : null,
      glow: !!glow,
      volume: !!volume,
      particles: particles.length,
      phoneGlass: !!glass,
      forbidden: forbidden.map((sel) => ({
        sel,
        count: document.querySelectorAll(sel).length,
      })),
      leftClean: !document.querySelector(".experience-copy .experience-ambient"),
    };
  });
  console.log(JSON.stringify(audit, null, 2));

  const heading = await page.$("#experience-qpick-heading");
  const sectionHandle = await heading.evaluateHandle((el) =>
    el.closest("section"),
  );
  await sectionHandle.asElement().screenshot({
    path: path.join(OUT, "26-experience-minimal.png"),
  });
  console.log("wrote 26-experience-minimal.png");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
