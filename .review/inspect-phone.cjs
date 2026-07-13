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
    waitUntil: "networkidle2",
  });
  await page.waitForSelector('[aria-label^="Q Pick app preview"]');
  const info = await page.evaluate(() => {
    const el = document.querySelector(
      '[aria-label^="Q Pick app preview"]',
    );
    const cs = getComputedStyle(el);
    return {
      transform: cs.transform,
      animation: cs.animationName,
      width: cs.width,
      height: cs.height,
      classes: el.className,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
