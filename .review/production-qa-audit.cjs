/**
 * Production QA audit — overflow, hero overlap, i18n gaps across breakpoints.
 * Usage: node .review/production-qa-audit.cjs
 */
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.QA_BASE || "http://localhost:3000";
const OUT = path.join(__dirname, "qa-report.json");

const PAGES = [
  "/",
  "/ride",
  "/airport",
  "/tours",
  "/drive",
  "/safety",
  "/about",
  "/support",
  "/partners",
  "/destinations",
  "/legal/privacy",
  "/legal/terms",
];

const LOCALES = ["en", "si", "ta"];

/** Representative of requested phone/tablet/desktop matrix */
const VIEWPORTS = [
  { name: "iPhone-SE-2022", width: 375, height: 667 },
  { name: "iPhone-12", width: 390, height: 844 },
  { name: "iPhone-14", width: 390, height: 844 },
  { name: "iPhone-15", width: 393, height: 852 },
  { name: "iPhone-15-Plus", width: 430, height: 932 },
  { name: "iPhone-15-Pro-Max", width: 430, height: 932 },
  { name: "Pixel-7", width: 412, height: 915 },
  { name: "Pixel-9-Pro", width: 412, height: 915 },
  { name: "S24", width: 360, height: 780 },
  { name: "S24-Ultra", width: 412, height: 915 },
  { name: "Fold-closed", width: 280, height: 653 },
  { name: "Fold-open", width: 690, height: 829 },
  { name: "iPad-Mini", width: 768, height: 1024 },
  { name: "iPad-Air", width: 820, height: 1180 },
  { name: "iPad-Pro-11", width: 834, height: 1194 },
  { name: "iPad-Pro-12.9", width: 1024, height: 1366 },
  { name: "Surface-Pro", width: 912, height: 1368 },
  { name: "d-1280", width: 1280, height: 720 },
  { name: "d-1366", width: 1366, height: 768 },
  { name: "d-1440", width: 1440, height: 900 },
  { name: "d-1536", width: 1536, height: 864 },
  { name: "d-1728", width: 1728, height: 1117 },
  { name: "d-1920", width: 1920, height: 1080 },
  { name: "d-2560", width: 2560, height: 1440 },
  // breakpoint edges
  { name: "bp-320", width: 320, height: 568 },
  { name: "bp-360", width: 360, height: 640 },
  { name: "bp-480", width: 480, height: 800 },
  { name: "bp-640", width: 640, height: 900 },
  { name: "bp-600", width: 600, height: 900 },
];

async function setLocale(page, locale) {
  await page.setCookie({
    name: "qp_locale",
    value: locale,
    url: BASE,
  });
}

async function auditPage(page) {
  return page.evaluate(() => {
    const issues = [];
    const docW = document.documentElement.clientWidth;
    const scrollW = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    );
    if (scrollW > docW + 2) {
      issues.push({
        type: "horizontal-overflow",
        detail: `scrollWidth ${scrollW} > clientWidth ${docW}`,
      });
    }

    // Absolute-positioned hero slots overflowing reserved height
    document.querySelectorAll(".hero-title-slot, .hero-sub-slot, .hero-body-slot, .hero-cta-slot").forEach((slot) => {
      const active = slot.querySelector("[class*='hero-'], h1, p, div");
      const kids = [...slot.children].filter((el) => {
        const s = getComputedStyle(el);
        return s.opacity !== "0" && s.visibility !== "hidden";
      });
      const target = kids.find((el) => getComputedStyle(el).position === "absolute") || kids[0];
      if (!target) return;
      const sr = slot.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      if (tr.height > sr.height + 4) {
        issues.push({
          type: "hero-slot-overflow",
          el: slot.className,
          slotH: Math.round(sr.height),
          contentH: Math.round(tr.height),
          text: (target.textContent || "").slice(0, 80),
        });
      }
    });

    // Trust labels with one character per line / extreme wrapping
    document.querySelectorAll(".hero-trust-label").forEach((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const lh = parseFloat(style.lineHeight) || 20;
      const lines = Math.round(rect.height / lh);
      const words = (el.textContent || "").trim().split(/\s+/).length;
      if (lines > 3 || (words <= 3 && lines >= 3 && rect.width < 60)) {
        issues.push({
          type: "trust-vertical-wrap",
          text: (el.textContent || "").trim(),
          lines,
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        });
      }
    });

    // Clipped text (overflow hidden + scrollHeight larger)
    document.querySelectorAll("h1,h2,h3,p,button,a,label,span").forEach((el) => {
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden" || s.opacity === "0") return;
      if (s.overflow === "hidden" || s.overflowX === "hidden" || s.textOverflow === "ellipsis") {
        if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
          const text = (el.textContent || "").trim();
          if (text.length > 2) {
            issues.push({
              type: "text-clip",
              tag: el.tagName,
              class: String(el.className).slice(0, 60),
              text: text.slice(0, 60),
              scrollW: el.scrollWidth,
              clientW: el.clientWidth,
            });
          }
        }
      }
    });

    // Overlapping fixed headers with text (basic)
    const header = document.querySelector("header");
    if (header) {
      const hr = header.getBoundingClientRect();
      if (hr.height > 0) {
        document.querySelectorAll("h1, .hero-title, .hero-sub").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < hr.bottom - 4 && r.bottom > hr.top && r.width > 0) {
            // only flag if element is meaningfully under header band
            if (r.top < hr.bottom && r.top > -20 && window.scrollY < 40) {
              issues.push({
                type: "under-header",
                text: (el.textContent || "").trim().slice(0, 50),
                top: Math.round(r.top),
                headerBottom: Math.round(hr.bottom),
              });
            }
          }
        });
      }
    }

    return {
      title: document.title,
      lang: document.documentElement.lang,
      issues: issues.slice(0, 40),
      issueCount: issues.length,
    };
  });
}

(async () => {
  const report = {
    base: BASE,
    startedAt: new Date().toISOString(),
    results: [],
    summary: { checks: 0, withIssues: 0, byType: {} },
  };

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--hide-scrollbars", "--no-sandbox"],
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);

  // Full matrix would be huge — sample: all pages × 3 langs × key VPs; plus home deep-dive
  const deepHome = VIEWPORTS;
  const otherVp = [
    { name: "phone-375", width: 375, height: 667 },
    { name: "phone-393", width: 393, height: 852 },
    { name: "phone-430", width: 430, height: 932 },
    { name: "tablet-768", width: 768, height: 1024 },
    { name: "tablet-1024", width: 1024, height: 1366 },
    { name: "d-1440", width: 1440, height: 900 },
    { name: "d-1920", width: 1920, height: 1080 },
  ];

  for (const locale of LOCALES) {
    await setLocale(page, locale);

    for (const route of PAGES) {
      const vps = route === "/" ? deepHome : otherVp;
      for (const vp of vps) {
        await page.setViewport({
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
        });
        try {
          await page.goto(`${BASE}${route}`, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          });
          await new Promise((r) => setTimeout(r, route === "/" ? 700 : 350));
          // scroll through page to force layout of below-fold
          await page.evaluate(async () => {
            const h = document.body.scrollHeight;
            for (let y = 0; y < h; y += Math.max(400, window.innerHeight * 0.8)) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 40));
            }
            window.scrollTo(0, 0);
          });
          await new Promise((r) => setTimeout(r, 200));
          const result = await auditPage(page);
          const entry = {
            locale,
            route,
            viewport: vp.name,
            w: vp.width,
            h: vp.height,
            ...result,
          };
          report.results.push(entry);
          report.summary.checks += 1;
          if (result.issueCount > 0) {
            report.summary.withIssues += 1;
            for (const iss of result.issues) {
              report.summary.byType[iss.type] =
                (report.summary.byType[iss.type] || 0) + 1;
            }
          }
        } catch (err) {
          report.results.push({
            locale,
            route,
            viewport: vp.name,
            error: String(err.message || err),
          });
          report.summary.checks += 1;
          report.summary.withIssues += 1;
          report.summary.byType.navError =
            (report.summary.byType.navError || 0) + 1;
        }
        process.stdout.write(".");
      }
    }
  }

  // Aggregate top issues
  const byKey = {};
  for (const r of report.results) {
    if (!r.issues) continue;
    for (const iss of r.issues) {
      const key = `${iss.type}|${iss.text || iss.detail || iss.el || ""}`;
      if (!byKey[key]) byKey[key] = { ...iss, count: 0, samples: [] };
      byKey[key].count += 1;
      if (byKey[key].samples.length < 5) {
        byKey[key].samples.push({
          locale: r.locale,
          route: r.route,
          viewport: r.viewport,
          w: r.w,
        });
      }
    }
  }
  report.topIssues = Object.values(byKey)
    .sort((a, b) => b.count - a.count)
    .slice(0, 40);
  report.finishedAt = new Date().toISOString();

  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log("\nWrote", OUT);
  console.log("Summary", report.summary);
  console.log(
    "Top issues:\n",
    report.topIssues
      .slice(0, 15)
      .map((i) => `${i.count}× ${i.type}: ${(i.text || i.detail || "").slice(0, 60)}`)
      .join("\n"),
  );

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
