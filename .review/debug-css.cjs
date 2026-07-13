const puppeteer = require("puppeteer-core");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);

  const cssTexts = [];
  page.on("response", async (res) => {
    const url = res.url();
    const ct = res.headers()["content-type"] || "";
    if (ct.includes("text/css") || url.includes(".css")) {
      try {
        const text = await res.text();
        if (text.includes("experience-headline")) {
          cssTexts.push({ url, snippet: text.match(/\.experience-headline\s*\{[^}]+\}/)?.[0] });
        }
      } catch {}
    }
  });

  await page.goto("http://localhost:3000/?nocache=" + Date.now(), {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  // Also dump all style tags
  const inline = await page.evaluate(() => {
    return [...document.querySelectorAll("style, link[rel=stylesheet]")].map(
      (el) => {
        if (el.tagName === "STYLE") {
          const t = el.textContent || "";
          return {
            type: "style",
            has: t.includes("experience-headline"),
            snippet: t.match(/\.experience-headline\s*\{[^}]+\}/)?.[0] || null,
            len: t.length,
          };
        }
        return { type: "link", href: el.getAttribute("href") };
      },
    );
  });

  console.log("network css hits", JSON.stringify(cssTexts, null, 2));
  console.log("dom styles", JSON.stringify(inline, null, 2));

  // Read raw file from disk for comparison
  const disk = fs.readFileSync("D:/quickpickapp/app/globals.css", "utf8");
  const diskRule = disk.match(/\.experience-headline\s*\{[\s\S]*?\n\}/)?.[0];
  console.log("DISK RULE:\n", diskRule);

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
