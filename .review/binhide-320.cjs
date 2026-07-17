const puppeteer = require("puppeteer-core");

(async () => {
  const b = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await b.newPage();
  await page.setViewport({
    width: 320,
    height: 844,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto("http://localhost:3000/", {
    waitUntil: "networkidle2",
    timeout: 90000,
  });

  const info = await page.evaluate(() => {
    const base = () => document.documentElement.scrollWidth;
    const results = { initial: base() };
    for (const sec of document.querySelectorAll("main section, main > div")) {
      const cls = String(sec.className).slice(0, 70);
      const prev = sec.style.display;
      sec.style.display = "none";
      results[cls] = base();
      sec.style.display = prev;
    }
    // also hide marquees / destination orbs
    for (const sel of [
      ".trust-chip-marquee",
      ".destination-strip",
      ".hqw-carousel",
      ".experience-stage",
      ".iqpa-stage",
      ".tx-stage",
      "footer",
      "header",
    ]) {
      const nodes = [...document.querySelectorAll(sel)];
      if (!nodes.length) continue;
      const prev = nodes.map((n) => n.style.display);
      nodes.forEach((n) => {
        n.style.display = "none";
      });
      results["hide:" + sel] = base();
      nodes.forEach((n, i) => {
        n.style.display = prev[i];
      });
    }
    return results;
  });
  console.log(JSON.stringify(info, null, 2));
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
