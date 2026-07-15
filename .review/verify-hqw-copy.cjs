const puppeteer = require("puppeteer-core");
const path = require("path");
const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
  await page.evaluate(() => {
    document
      .querySelector("#how-qpick-works-heading")
      ?.closest("section")
      ?.scrollIntoView({ block: "center" });
  });
  await new Promise((r) => setTimeout(r, 900));

  const info = await page.evaluate(() => {
    const section = document
      .querySelector("#how-qpick-works-heading")
      .closest("section");
    const phones = [...section.querySelectorAll(".hqw-device")].map((el, i) => {
      const t = getComputedStyle(el).transform;
      const m = t.match(/matrix\(([^)]+)\)/);
      const parts = m ? m[1].split(",").map(Number) : [];
      return { i: i + 1, ty: parts[5] ?? 0, h: Math.round(el.getBoundingClientRect().height) };
    });
    const labels = [...section.querySelectorAll(".hqw-step-label")].map((el) =>
      Math.round(el.getBoundingClientRect().top),
    );
    const titles = [...section.querySelectorAll(".hqw-step-title")].map((el) =>
      Math.round(el.getBoundingClientRect().top),
    );
    const bodies = [...section.querySelectorAll(".hqw-step-body")].map((el) =>
      Math.round(el.getBoundingClientRect().top),
    );
    const copies = [...section.querySelectorAll(".hqw-copy")].map((el) =>
      Math.round(el.getBoundingClientRect().height),
    );
    const spread = (arr) => Math.max(...arr) - Math.min(...arr);
    return {
      phones,
      labels,
      titles,
      bodies,
      copies,
      labelAligned: spread(labels) <= 1,
      titleAligned: spread(titles) <= 1,
      bodyAligned: spread(bodies) <= 1,
      copySameH: spread(copies) <= 2,
    };
  });
  console.log(JSON.stringify(info, null, 2));

  const heading = await page.$("#how-qpick-works-heading");
  const section = (
    await heading.evaluateHandle((el) => el.closest("section"))
  ).asElement();
  await section.screenshot({
    path: path.join(__dirname, "hqw-copy-align.png"),
  });
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
