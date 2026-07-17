const puppeteer = require("puppeteer-core");

(async () => {
  const b = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await b.newPage();
  const warnings = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (/opacity|undefined|animat/i.test(text)) warnings.push(text);
  });
  page.on("pageerror", (err) => warnings.push(String(err)));

  await page.setViewport({ width: 1280, height: 900 });
  await page.goto("http://localhost:3000/", {
    waitUntil: "networkidle2",
    timeout: 90000,
  });
  // Scroll through page to trigger whileInView / AnimatePresence
  for (let y = 0; y < 8000; y += 600) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await new Promise((r) => setTimeout(r, 200));
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 500));

  // Mobile pass
  await page.setViewport({
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
  });
  await page.reload({ waitUntil: "networkidle2", timeout: 90000 });
  for (let y = 0; y < 8000; y += 600) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await new Promise((r) => setTimeout(r, 200));
  }

  const unique = [...new Set(warnings)];
  console.log(JSON.stringify({ count: unique.length, warnings: unique }, null, 2));
  await b.close();
  if (unique.some((w) => /opacity from ["']?undefined/i.test(w))) {
    process.exit(1);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
