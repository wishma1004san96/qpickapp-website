const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.goto("http://localhost:3000/?t=" + Date.now(), {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector("#experience-qpick-heading");

  const info = await page.evaluate(() => {
    const h = getComputedStyle(
      document.querySelector("#experience-qpick-heading"),
    );
    const bodyWrap = document.querySelector(".experience-body");
    const bp = getComputedStyle(document.querySelector(".experience-body p"));
    const phone = document.querySelector('[aria-label^="Q Pick app preview"]');
    const stage = getComputedStyle(document.querySelector(".experience-stage"));
    const badges = document.querySelector(".experience-store-row--desktop");
    return {
      stageBg: stage.backgroundColor,
      stageFont: stage.fontFamily,
      h: {
        size: h.fontSize,
        weight: h.fontWeight,
        lh: h.lineHeight,
        tracking: h.letterSpacing,
        color: h.color,
        family: h.fontFamily,
      },
      body: {
        size: bp.fontSize,
        weight: bp.fontWeight,
        lh: bp.lineHeight,
        color: bp.color,
        marginTop: getComputedStyle(bodyWrap).marginTop,
      },
      badgeMt: badges ? getComputedStyle(badges).marginTop : null,
      phoneH: phone ? Math.round(phone.getBoundingClientRect().height) : null,
      phoneTransform: phone ? getComputedStyle(phone).transform : null,
    };
  });

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
