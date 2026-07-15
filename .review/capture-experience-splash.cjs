const puppeteer = require("puppeteer-core");
const path = require("path");
const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/?journey=splash", {
    waitUntil: "networkidle2",
  });
  await page.waitForSelector("#experience-qpick-heading");
  await page.evaluate(() => {
    const heading = document.querySelector("#experience-qpick-heading");
    const section = heading?.closest("section");
    const header = document.querySelector("header");
    if (header) header.style.visibility = "hidden";
    if (!section) return;
    window.scrollTo(
      0,
      section.getBoundingClientRect().top + window.scrollY - 20,
    );
  });
  await new Promise((r) => setTimeout(r, 2500));

  const info = await page.evaluate(() => {
    const section = document
      .querySelector("#experience-qpick-heading")
      ?.closest("section");
    const display = section?.querySelector(".experience-phone-display");
    return {
      hasSplash: Boolean(
        section?.querySelector(
          ".experience-app--splash, .experience-splash-logo-wrap",
        ),
      ),
      displayChildren: display?.children.length ?? 0,
      phoneH: Math.round(
        section
          ?.querySelector(".experience-phone-parallax")
          ?.getBoundingClientRect().height ?? 0,
      ),
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    };
  });
  console.log(info);

  const heading = await page.$("#experience-qpick-heading");
  const section = (
    await heading.evaluateHandle((el) => el.closest("section"))
  ).asElement();
  await section.screenshot({
    path: path.join(__dirname, "experience-restored-desktop.png"),
  });
  console.log("wrote desktop");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
