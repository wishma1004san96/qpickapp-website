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
  await page.goto("http://localhost:3000/?map=" + Date.now(), {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

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

  await page.waitForFunction(
    () => {
      const live = document.querySelector(".experience-live");
      const screen = live?.closest(".experience-phone-screen");
      return screen && getComputedStyle(screen).opacity === "1";
    },
    { timeout: 25000 },
  );

  await new Promise((r) => setTimeout(r, 1800));

  const audit = await page.evaluate(() => {
    const live = document.querySelector(".experience-live");
    return {
      hasBasemap: !!document.querySelector(".experience-live-basemap"),
      hasNav: !!document.querySelector(".experience-live-nav"),
      hasCar: !!document.querySelector(".experience-live-car"),
      hasPickup: !!document.querySelector(".experience-live-pin--pickup"),
      hasDrop: !!document.querySelector(".experience-live-pin--drop"),
      status: document.querySelector(".experience-live-status-text")?.textContent,
      noOldGrid: !document.querySelector(".experience-live-map-grid"),
      cardGlass: !!document.querySelector(".experience-live-card"),
      livePresent: !!live,
    };
  });
  console.log(JSON.stringify(audit, null, 2));

  const heading = await page.$("#experience-qpick-heading");
  const sectionHandle = await heading.evaluateHandle((el) =>
    el.closest("section"),
  );
  await sectionHandle.asElement().screenshot({
    path: path.join(OUT, "29-experience-realistic-map.png"),
  });
  console.log("wrote 29-experience-realistic-map.png");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
