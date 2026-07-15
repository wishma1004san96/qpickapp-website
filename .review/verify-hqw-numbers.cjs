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
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        i: i + 1,
        transform: s.transform,
        h: Math.round(r.height),
        w: Math.round(r.width),
      };
    });
    const dots = [...section.querySelectorAll(".hqw-step-dot")].map((el) => {
      const r = el.getBoundingClientRect();
      const stack = document.elementsFromPoint(
        r.left + r.width / 2,
        r.top + r.height / 2,
      );
      const coveredByPhone = stack.some(
        (node) =>
          node.closest?.(".hqw-device-shell") &&
          !node.closest?.(".hqw-step-dot"),
      );
      return {
        n: el.textContent.trim(),
        top: Math.round(r.top),
        coveredByPhone,
        z: getComputedStyle(el).zIndex,
      };
    });
    return { phones, dots };
  });
  console.log(JSON.stringify(info, null, 2));

  const heading = await page.$("#how-qpick-works-heading");
  const section = (
    await heading.evaluateHandle((el) => el.closest("section"))
  ).asElement();
  await section.screenshot({
    path: path.join(__dirname, "hqw-numbers-fix.png"),
  });
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
