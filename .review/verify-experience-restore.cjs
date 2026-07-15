const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = path.join(__dirname);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
  });
  const page = await browser.newPage();
  const results = [];

  for (const locale of ["en", "si", "ta"]) {
    await page.setCookie({
      name: "qp_locale",
      value: locale,
      url: "http://localhost:3000",
    });

    for (const vp of [
      { w: 375, h: 812, n: "mobile" },
      { w: 768, h: 1024, n: "tablet" },
      { w: 1440, h: 900, n: "desktop" },
    ]) {
      await page.setViewport({ width: vp.w, height: vp.h });
      await page.goto("http://localhost:3000/", {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      await new Promise((r) => setTimeout(r, 600));

      const info = await page.evaluate(() => {
        const heading = document.querySelector("#experience-qpick-heading");
        const section = heading?.closest("section");
        if (!heading || !section) return { found: false };

        section.scrollIntoView({ block: "center" });
        const body = section.querySelector(".experience-body");
        const phone =
          section.querySelector("[aria-label*='Q Pick app preview']") ||
          section.querySelector(".experience-device");
        const hr = heading.getBoundingClientRect();
        const br = body?.getBoundingClientRect();
        const pr = phone?.getBoundingClientRect();
        const overflow =
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 2;

        return {
          found: true,
          heading: heading.textContent.replace(/\s+/g, " ").trim().slice(0, 90),
          lines: [...(body?.querySelectorAll("p") || [])].map((p) =>
            p.textContent.trim(),
          ),
          headingVisible: hr.height > 0,
          phoneVisible: Boolean(pr && pr.height > 40),
          phoneH: pr ? Math.round(pr.height) : 0,
          storeCount: section.querySelectorAll(
            ".experience-store-row a, .experience-store-row button",
          ).length,
          overflow,
          bodyOverlap:
            br && hr ? hr.bottom > br.top + 2 && hr.bottom < br.bottom : false,
        };
      });

      results.push({ locale, vp: vp.n, ...info });

      if (locale === "en" && vp.n === "desktop") {
        await page.screenshot({
          path: path.join(OUT, "experience-restored-desktop.png"),
        });
      }
      if (locale === "en" && vp.n === "mobile") {
        await page.screenshot({
          path: path.join(OUT, "experience-restored-mobile.png"),
        });
      }
      if (locale === "ta" && vp.n === "desktop") {
        await page.screenshot({
          path: path.join(OUT, "experience-restored-ta-desktop.png"),
        });
      }
    }
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
