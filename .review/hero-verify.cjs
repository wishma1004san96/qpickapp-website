/**
 * Focused post-fix hero/trust/overflow check.
 */
const puppeteer = require("puppeteer-core");
const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";

const VIEWS = [
  { name: "320", width: 320, height: 568 },
  { name: "375", width: 375, height: 667 },
  { name: "393", width: 393, height: 852 },
  { name: "430", width: 430, height: 932 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 1366 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--hide-scrollbars"],
  });
  const page = await browser.newPage();
  const findings = [];

  for (const locale of ["en", "si", "ta"]) {
    await page.setCookie({ name: "qp_locale", value: locale, url: BASE });
    for (const vp of VIEWS) {
      await page.setViewport(vp);
      await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
      await new Promise((r) => setTimeout(r, 500));
      const result = await page.evaluate(() => {
        const issues = [];
        const docW = document.documentElement.clientWidth;
        const scrollW = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth,
        );
        if (scrollW > docW + 2) {
          issues.push(`h-overflow ${scrollW}>${docW}`);
        }

        const title = document.querySelector(".hero-title");
        const sub = document.querySelector(".hero-sub");
        const body = document.querySelector(".hero-body");
        const header = document.querySelector("header");
        if (title && sub && body && header) {
          const hr = header.getBoundingClientRect();
          const tr = title.getBoundingClientRect();
          const sr = sub.getBoundingClientRect();
          const br = body.getBoundingClientRect();
          if (tr.bottom > sr.top + 1)
            issues.push(`title/sub overlap ${Math.round(tr.bottom - sr.top)}`);
          if (sr.bottom > br.top + 1)
            issues.push(`sub/body overlap ${Math.round(sr.bottom - br.top)}`);
          if (tr.top < hr.bottom - 2 && window.scrollY < 10)
            issues.push(`title under header by ${Math.round(hr.bottom - tr.top)}`);
        }

        document.querySelectorAll(".hero-trust-label").forEach((el) => {
          const rect = el.getBoundingClientRect();
          const lh = parseFloat(getComputedStyle(el).lineHeight) || 18;
          const lines = Math.round(rect.height / lh);
          if (lines >= 4)
            issues.push(`trust wrap ${lines}L: ${(el.textContent || "").trim()}`);
        });

        // Real page overflow excluding skip-link / visually hidden
        [...document.querySelectorAll("body *")].forEach((el) => {
          const s = getComputedStyle(el);
          if (s.position === "fixed" || s.position === "sticky") return;
          const r = el.getBoundingClientRect();
          if (r.right > window.innerWidth + 2 && r.width > 8 && r.height > 8) {
            const cls = String(el.className || "").slice(0, 40);
            if (!cls.includes("skip") && el.id !== "experience") {
              issues.push(`oob ${el.tagName}.${cls}`.slice(0, 60));
            }
          }
        });

        return {
          title: (title?.textContent || "").trim().slice(0, 40),
          issues: [...new Set(issues)].slice(0, 12),
        };
      });
      if (result.issues.length) {
        findings.push({ locale, vp: vp.name, ...result });
      }
      process.stdout.write(".");
    }
  }

  console.log("\nFindings:", findings.length);
  console.log(JSON.stringify(findings, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
