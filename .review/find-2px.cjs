const puppeteer = require("puppeteer-core");

(async () => {
  const b = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox"],
  });

  for (const width of [320, 768]) {
    const page = await b.newPage();
    await page.setViewport({
      width,
      height: width >= 768 ? 1024 : 844,
      deviceScaleFactor: 1,
      isMobile: width < 768,
      hasTouch: width < 768,
    });
    await page.goto("http://localhost:3000/", {
      waitUntil: "networkidle2",
      timeout: 90000,
    });

    const info = await page.evaluate((vw) => {
      const doc = document.documentElement;
      const hits = [];
      for (const el of document.body.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 0.5 || r.left < -0.5) {
          const cs = getComputedStyle(el);
          hits.push({
            cls: String(el.className || el.tagName).slice(0, 90),
            left: Math.round(r.left * 10) / 10,
            right: Math.round(r.right * 10) / 10,
            w: Math.round(r.width),
            position: cs.position,
            overflow: cs.overflow,
            parent: String(el.parentElement?.className || "").slice(0, 50),
          });
        }
      }
      hits.sort((a, b) => b.right - a.right);
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        top: hits.slice(0, 20),
      };
    }, width);

    console.log("\n===", width, "===");
    console.log(JSON.stringify(info, null, 2));
    await page.close();
  }
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
