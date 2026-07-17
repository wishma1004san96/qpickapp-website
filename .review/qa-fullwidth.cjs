const puppeteer = require("puppeteer-core");
const fs = require("fs");

const widths = [320, 360, 375, 390, 430];

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
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await page.goto("http://localhost:3000/", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });
    const m = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyW: document.body.getBoundingClientRect().width,
      mainW: document.getElementById("main")?.getBoundingClientRect().width,
      headerW: document.querySelector("header")?.getBoundingClientRect().width,
      heroW: document
        .querySelector("main section")
        ?.getBoundingClientRect().width,
      meta: document.querySelector('meta[name="viewport"]')?.content,
    }));
    const ok =
      m.scrollWidth <= m.clientWidth + 1 &&
      m.innerWidth === m.clientWidth &&
      Math.abs(m.mainW - width) < 2;
    results.push({ width, ok, ...m });
    await page.screenshot({
      path: `.review/mobile-fullwidth-${width}.png`,
      fullPage: false,
    });
    await page.close();
  }

  console.log(JSON.stringify(results, null, 2));
  fs.writeFileSync(
    ".review/mobile-fullwidth-qa.json",
    JSON.stringify(results, null, 2),
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
