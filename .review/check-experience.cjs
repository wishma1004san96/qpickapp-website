const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForSelector("#experience-qpick-heading");
  const info = await page.evaluate(() => {
    const h = document.querySelector("#experience-qpick-heading");
    const phone = document.querySelector(
      '[aria-label^="Q Pick app preview"]',
    );
    const rows = [...document.querySelectorAll(".experience-store-row")].filter(
      (el) => getComputedStyle(el).display !== "none",
    );
    const hs = getComputedStyle(h);
    const pr = phone.getBoundingClientRect();
    return {
      size: hs.fontSize,
      lh: hs.lineHeight,
      font: hs.fontFamily.split(",")[0],
      phoneH: Math.round(pr.height),
      visibleRows: rows.length,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
