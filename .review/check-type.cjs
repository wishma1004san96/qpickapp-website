const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.goto("http://localhost:3000/?v=" + Date.now(), {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector("#experience-qpick-heading");

  const info = await page.evaluate(() => {
    const h = document.querySelector("#experience-qpick-heading");
    const body = document.querySelector(".experience-body");
    const p = document.querySelector(".experience-body p");
    const hs = getComputedStyle(h);
    const bs = getComputedStyle(body);
    const ps = getComputedStyle(p);

    // Find which stylesheet rule wins for font-size
    const sheets = [...document.styleSheets].flatMap((sheet) => {
      try {
        return [...sheet.cssRules].map((r) => r.cssText);
      } catch {
        return [];
      }
    });
    const headlineRules = sheets.filter((t) =>
      t.includes("experience-headline"),
    );
    const bodyRules = sheets.filter((t) =>
      t.includes(".experience-body"),
    );

    return {
      headline: {
        size: hs.fontSize,
        weight: hs.fontWeight,
        lh: hs.lineHeight,
        tracking: hs.letterSpacing,
        transform: hs.transform,
        family: hs.fontFamily,
      },
      body: {
        size: ps.fontSize,
        weight: ps.fontWeight,
        bodyWeight: bs.fontWeight,
        maxW: bs.maxWidth,
        tracking: ps.letterSpacing,
      },
      headlineRules,
      bodyRules: bodyRules.slice(0, 8),
      images: document.querySelectorAll(".experience-phone-display img")
        .length,
    };
  });

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
