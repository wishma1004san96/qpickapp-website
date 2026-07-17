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
    width: 768,
    height: 1024,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  });
  await page.goto("http://localhost:3000/", {
    waitUntil: "networkidle2",
    timeout: 90000,
  });

  const info = await page.evaluate(() => {
    const base = () => document.documentElement.scrollWidth;
    const results = { initial: base() };
    for (const sec of document.querySelectorAll("main section")) {
      const cls = String(sec.className).slice(0, 60);
      const prev = sec.style.display;
      sec.style.display = "none";
      const w = base();
      if (w <= 768) results["FIX:" + cls] = w;
      else results[cls] = w;
      sec.style.display = prev;
    }
    for (const sel of [
      ".tx-stage",
      ".iqpa-stage",
      ".experience-stage",
      ".hqw-carousel",
      ".destination-strip",
      ".fleet-stage",
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
