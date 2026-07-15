const puppeteer = require("puppeteer-core");
const path = require("path");
const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const VIEWS = [
  { name: "se", width: 375, height: 667 },
  { name: "ip13", width: 390, height: 844 },
  { name: "ip15pm", width: 430, height: 932 },
  { name: "s22", width: 360, height: 780 },
  { name: "s24u", width: 412, height: 915 },
  { name: "pixel7", width: 412, height: 915 },
  { name: "ipad", width: 768, height: 1024 },
  { name: "ipadpro", width: 1024, height: 1366 },
  { name: "d1440", width: 1440, height: 900 },
  { name: "d1536", width: 1536, height: 864 },
  { name: "d1728", width: 1728, height: 1117 },
  { name: "d1920", width: 1920, height: 1080 },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
  });
  const page = await browser.newPage();
  const report = [];

  for (const vp of VIEWS) {
    await page.setViewport(vp);
    await page.goto("http://localhost:3000/", {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.evaluate(() => {
      document
        .querySelector("#how-qpick-works-heading")
        ?.closest("section")
        ?.scrollIntoView({ block: "center" });
    });
    await new Promise((r) => setTimeout(r, 700));

    const info = await page.evaluate(() => {
      const section = document
        .querySelector("#how-qpick-works-heading")
        ?.closest("section");
      if (!section) return { ok: false };
      const dots = [...section.querySelectorAll(".hqw-step-dot")].map((el) => {
        const r = el.getBoundingClientRect();
        return {
          n: el.textContent.trim(),
          top: Math.round(r.top),
          left: Math.round(r.left),
          h: Math.round(r.height),
          visible: r.width > 0 && r.height > 0,
        };
      });
      const phones = [...section.querySelectorAll(".hqw-device-shell")].map(
        (el) => {
          const r = el.getBoundingClientRect();
          return {
            h: Math.round(r.height),
            w: Math.round(r.width),
            top: Math.round(r.top),
          };
        },
      );
      const heights = phones.map((p) => p.h);
      const sameH =
        heights.length > 0 &&
        Math.max(...heights) - Math.min(...heights) <= 2;
      const dotTops = dots.map((d) => d.top);
      const dotsAligned =
        dotTops.length > 0 &&
        Math.max(...dotTops) - Math.min(...dotTops) <= 3;

      // Check dots not covered by phones (sample center of each dot)
      const covered = [];
      for (const dot of section.querySelectorAll(".hqw-step-dot")) {
        const r = dot.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const stack = document.elementsFromPoint(cx, cy);
        const first = stack.find(
          (el) =>
            el.classList?.contains("hqw-step-dot") ||
            el.closest?.(".hqw-device"),
        );
        if (first && !first.classList?.contains("hqw-step-dot") && !first.closest(".hqw-step-dot")) {
          covered.push(dot.textContent.trim());
        }
      }

      const track = section.querySelector(
        ".hqw-step--layer-5 .experience-live, .hqw-step:last-child .experience-live",
      );
      const mapVisible = track
        ? getComputedStyle(
            track.querySelector(".experience-live-world") || track,
          ).opacity
        : null;
      const hasMap = Boolean(track?.querySelector(".experience-live-basemap"));
      const hasEta = Boolean(track?.querySelector(".experience-live-eta-badge"));
      const hasFabs = Boolean(track?.querySelector(".experience-live-fabs"));
      const hasPulse = Boolean(
        track?.querySelector(".experience-live-svg-car-pulse"),
      );
      const overflow =
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 2;

      return {
        ok: true,
        sameH,
        heights,
        dotsAligned,
        dotTops,
        covered,
        hasMap,
        mapOpacity: mapVisible,
        hasEta,
        hasFabs,
        hasPulse,
        overflow,
        allDotsVisible: dots.every((d) => d.visible),
      };
    });

    report.push({ vp: vp.name, w: vp.width, ...info });
    if (vp.name === "d1440" || vp.name === "ip15pm" || vp.name === "ipad") {
      const section = await page.$("#how-qpick-works-heading");
      const handle = await section.evaluateHandle((el) =>
        el.closest("section"),
      );
      await handle.asElement().screenshot({
        path: path.join(__dirname, `hqw-polish-${vp.name}.png`),
      });
    }
  }

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
