const puppeteer = require("puppeteer-core");
const path = require("path");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = path.join(__dirname, "qa-hero-1440.png");
(async () => {
  const b = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: 1440, height: 900 },
  });
  const p = await b.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 800));
  const metrics = await p.evaluate(() => {
    const planner = document.querySelector(".hero-planner");
    const copy = document.querySelector(".hero-copy-col");
    const trust = document.querySelector(".hero-trust");
    const sub = document.querySelector(".hero-sub");
    const body = document.querySelector(".hero-body");
    const pr = planner?.getBoundingClientRect();
    return {
      win: window.innerWidth,
      scrollW: document.documentElement.scrollWidth,
      plannerRight: pr ? Math.round(pr.right) : null,
      plannerClipped: pr ? pr.right > window.innerWidth + 1 : null,
      subBottom: sub ? Math.round(sub.getBoundingClientRect().bottom) : null,
      bodyTop: body ? Math.round(body.getBoundingClientRect().top) : null,
      overlap: sub && body ? sub.getBoundingClientRect().bottom > body.getBoundingClientRect().top + 1 : null,
      trustText: [...document.querySelectorAll(".hero-trust-label")].map((e) => e.textContent.trim()),
      copyBottom: copy ? Math.round(copy.getBoundingClientRect().bottom) : null,
    };
  });
  console.log(JSON.stringify(metrics, null, 2));
  await p.screenshot({ path: OUT, fullPage: false });
  console.log("wrote", OUT);
  await b.close();
})();
