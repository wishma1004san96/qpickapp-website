const puppeteer = require("puppeteer-core");

const widths = [320, 360, 375, 390, 414, 430, 768];

(async () => {
  const b = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox"],
  });

  const results = [];
  for (const width of widths) {
    const page = await b.newPage();
    await page.setViewport({
      width,
      height: width >= 768 ? 1024 : 844,
      deviceScaleFactor: 2,
      isMobile: width < 768,
      hasTouch: width < 768,
    });
    await page.goto("http://localhost:3000/", {
      waitUntil: "networkidle2",
      timeout: 90000,
    });
    const m = await page.evaluate(() => {
      const wide = [];
      for (const el of document.body.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        // layout overflow: use offsetWidth chain approximation
        if (el.scrollWidth > document.documentElement.clientWidth + 2) {
          const cs = getComputedStyle(el);
          if (cs.overflowX === "visible" || cs.overflow === "visible") {
            wide.push({
              cls: String(el.className || el.tagName).slice(0, 70),
              sw: el.scrollWidth,
              cw: el.clientWidth,
            });
            if (wide.length > 12) break;
          }
        }
      }
      return {
        innerWidth: window.innerWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyW: Math.round(document.body.getBoundingClientRect().width),
        mainW: Math.round(
          document.getElementById("main")?.getBoundingClientRect().width || 0,
        ),
        headerW: Math.round(
          document.querySelector("header")?.getBoundingClientRect().width || 0,
        ),
        overflowX:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1,
        wideVisible: wide,
      };
    });
    const ok =
      !m.overflowX &&
      m.scrollWidth <= m.clientWidth + 1 &&
      m.innerWidth === m.clientWidth &&
      Math.abs(m.mainW - width) <= 1;
    results.push({ width, ok, ...m });
    await page.screenshot({
      path: `.review/arch-${width}.png`,
      fullPage: false,
    });
    await page.close();
  }

  console.log(JSON.stringify(results, null, 2));
  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.error("FAILED", failed.map((f) => f.width));
    process.exit(1);
  }
  console.log("ALL PASS");
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
