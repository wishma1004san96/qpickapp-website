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
  await new Promise((r) => setTimeout(r, 1200));

  const info = await page.evaluate(() => {
    const section = document
      .querySelector("#how-qpick-works-heading")
      .closest("section");
    const dots = [...section.querySelectorAll(".hqw-step-dot")].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        n: el.textContent.trim(),
        top: Math.round(r.top),
        left: Math.round(r.left),
      };
    });
    const phones = [...section.querySelectorAll(".hqw-device-shell")].map((el) =>
      Math.round(el.getBoundingClientRect().height),
    );
    const covered = [];
    for (const dot of section.querySelectorAll(".hqw-step-dot")) {
      const r = dot.getBoundingClientRect();
      const stack = document.elementsFromPoint(
        r.left + r.width / 2,
        r.top + r.height / 2,
      );
      const hit = stack.find(
        (el) =>
          el.classList?.contains("hqw-step-dot") ||
          el.closest?.(".hqw-device-shell") ||
          el.closest?.(".hqw-device"),
      );
      if (
        hit &&
        !hit.classList?.contains("hqw-step-dot") &&
        !hit.closest(".hqw-step-dot")
      ) {
        covered.push(dot.textContent.trim());
      }
    }
    const lives = [...section.querySelectorAll(".experience-live")];
    const last = lives[lives.length - 1];
    const world = last?.querySelector(".experience-live-world");
    return {
      dots,
      phones,
      sameH: Math.max(...phones) - Math.min(...phones) <= 1,
      dotsAligned:
        Math.max(...dots.map((d) => d.top)) -
          Math.min(...dots.map((d) => d.top)) <=
        2,
      covered,
      mapOpacity: world ? getComputedStyle(world).opacity : null,
      hasEta: Boolean(last?.querySelector(".experience-live-eta-badge")),
      hasCard: Boolean(last?.querySelector(".experience-live-card--tracking")),
      hasBasemap: Boolean(last?.querySelector(".experience-live-basemap")),
      hasFabs: Boolean(last?.querySelector(".experience-live-fabs")),
      overflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 2,
    };
  });
  console.log(JSON.stringify(info, null, 2));

  const heading = await page.$("#how-qpick-works-heading");
  const section = (
    await heading.evaluateHandle((el) => el.closest("section"))
  ).asElement();
  await section.screenshot({
    path: path.join(__dirname, "hqw-polish-d1440.png"),
  });

  const lastPhone = await page.$(".hqw-step--layer-5 .hqw-device-shell");
  if (lastPhone) {
    await lastPhone.screenshot({
      path: path.join(__dirname, "hqw-step05-phone.png"),
    });
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
