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
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto("http://localhost:3000/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  const info = await page.evaluate(() => {
    const base = () => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      innerWidth: window.innerWidth,
    });

    const results = { initial: base() };

    const selectors = [
      ".hqw-carousel",
      ".hqw-stage",
      ".trust-chip-marquee",
      "#hero-trust",
      ".fleet-stage-phone-plane",
      ".fleet-stage",
      ".experience-stage",
      ".experience-live-world",
      "header",
      "footer",
      ".yj-stage",
      ".destination-strip",
      ".drive-with-qpick",
    ];

    for (const sel of selectors) {
      const nodes = [...document.querySelectorAll(sel)];
      if (!nodes.length) {
        results[sel] = "missing";
        continue;
      }
      const prev = nodes.map((n) => n.style.display);
      nodes.forEach((n) => {
        n.style.display = "none";
      });
      results[sel] = { ...base(), count: nodes.length };
      nodes.forEach((n, i) => {
        n.style.display = prev[i];
      });
    }

    const sectionHits = [];
    for (const sec of document.querySelectorAll("main section")) {
      const cls = String(sec.className).slice(0, 80);
      const prev = sec.style.display;
      sec.style.display = "none";
      sectionHits.push({ cls, ...base() });
      sec.style.display = prev;
    }
    sectionHits.sort((a, b) => a.scrollWidth - b.scrollWidth);
    results.bestHides = sectionHits.slice(0, 10);

    return results;
  });

  console.log(JSON.stringify(info, null, 2));
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
