const puppeteer = require("puppeteer-core");
const path = require("path");

const OUT = path.join("D:", "quickpickapp", ".review");
const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: 1440, height: 1100, deviceScaleFactor: 1 },
    args: ["--hide-scrollbars"],
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.goto("http://localhost:3000/?v=" + Date.now(), {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector(".experience-phone-shell");

  const info = await page.evaluate(() => {
    const section = document
      .querySelector("#experience-qpick-heading")
      ?.closest("section");
    const phone = document.querySelector(".experience-phone-shell");
    const stage = document.querySelector(".experience-phone-stage");
    const parallax = document.querySelector(".experience-phone-parallax");
    const img = document.querySelector(".experience-phone-shot");
    const glass = document.querySelector(".experience-phone-glass");
    const sr = phone.getBoundingClientRect();
    const pr = parallax.getBoundingClientRect();
    const ss = getComputedStyle(phone);
    const ps = getComputedStyle(parallax);
    const gs = glass ? getComputedStyle(glass) : null;
    return {
      sectionH: Math.round(section.getBoundingClientRect().height),
      phone: {
        w: Math.round(sr.width),
        h: Math.round(sr.height),
        top: Math.round(sr.top),
        left: Math.round(sr.left),
        op: ss.opacity,
        vis: ss.visibility,
        z: ss.zIndex,
        shadow: ss.boxShadow,
        overflow: ss.overflow,
      },
      parallax: {
        w: Math.round(pr.width),
        h: Math.round(pr.height),
        top: Math.round(pr.top),
        left: Math.round(pr.left),
        op: ps.opacity,
        transform: ps.transform,
        overflow: ps.overflow,
      },
      glass: gs
        ? {
            op: gs.opacity,
            z: gs.zIndex,
            bg: gs.backgroundImage.slice(0, 80),
            blend: gs.mixBlendMode,
          }
        : null,
      imgSrc: img?.getAttribute("src"),
      imgNatural: img
        ? {
            w: img.naturalWidth,
            h: img.naturalHeight,
            complete: img.complete,
          }
        : null,
      ambientChildren: [
        ...document.querySelector(".experience-ambient").children,
      ].map((el) => el.className),
    };
  });
  console.log(JSON.stringify(info, null, 2));

  await page.evaluate(() => {
    const header = document.querySelector("header");
    if (header) header.style.visibility = "hidden";
    const section = document
      .querySelector("#experience-qpick-heading")
      ?.closest("section");
    if (section) {
      window.scrollTo(
        0,
        section.getBoundingClientRect().top + window.scrollY - 20,
      );
    }
  });
  await new Promise((r) => setTimeout(r, 800));

  const heading = await page.$("#experience-qpick-heading");
  const sectionHandle = await heading.evaluateHandle((el) =>
    el.closest("section"),
  );
  await sectionHandle.asElement().screenshot({
    path: path.join(OUT, "27-experience-minimal-full.png"),
  });
  await page.screenshot({
    path: path.join(OUT, "27-experience-viewport.png"),
  });
  console.log("wrote screenshots");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
