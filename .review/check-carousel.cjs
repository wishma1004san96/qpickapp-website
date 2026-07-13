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
  await page.goto("http://localhost:3000/?t=" + Date.now(), {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector("#experience-qpick-heading");

  const samples = [];
  for (let i = 0; i < 20; i++) {
    const snap = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll(".experience-phone-display img")];
      const layer = document.querySelector(
        ".experience-phone-display > div.absolute",
      );
      return {
        count: imgs.length,
        src: imgs[0]?.getAttribute("src")?.split("/").pop() || null,
        opacity: layer ? Number(getComputedStyle(layer).opacity) : null,
      };
    });
    samples.push(snap);
    await new Promise((r) => setTimeout(r, 350));
  }

  const overlaps = samples.filter((s) => s.count !== 1);
  const maxOpacityWhileChanging = samples.filter(
    (s, i, arr) =>
      i > 0 &&
      s.src !== arr[i - 1].src &&
      s.opacity > 0.05 &&
      arr[i - 1].opacity > 0.05,
  );

  console.log(JSON.stringify({ samples, overlaps, badSwaps: maxOpacityWhileChanging }, null, 2));

  if (overlaps.length) {
    console.error("FAIL: multiple images visible");
    process.exit(1);
  }
  console.log("CAROUSEL OK: always one image");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
