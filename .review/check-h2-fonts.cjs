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
    const h2 = document.querySelector("#experience-qpick-heading");
    const body = document.body;
    const stage = document.querySelector(".experience-stage");
    const copy = document.querySelector(".experience-body p");

    const h2s = getComputedStyle(h2);
    const bodys = getComputedStyle(body);
    const stages = getComputedStyle(stage);
    const copys = getComputedStyle(copy);

    return {
      h2: {
        fontFamily: h2s.fontFamily,
        className: h2.className,
      },
      body: {
        fontFamily: bodys.fontFamily,
        className: body.className,
      },
      experienceStageFontFamily: stages.fontFamily,
      experienceCopyFontFamily: copys.fontFamily,
      stageHasExplicitFontInStyle:
        stage.getAttribute("style")?.includes("font") ?? false,
    };
  });

  console.log(JSON.stringify(info, null, 2));

  const h2Ok = /^["']?Instrument Serif/.test(info.h2.fontFamily.trim());
  const h2NoSora = !/Sora/i.test(info.h2.fontFamily);
  const bodyOk = /^["']?Inter/.test(info.body.fontFamily.trim());
  const bodyNoSora = !/Sora/i.test(info.body.fontFamily);

  if (!h2Ok || !h2NoSora || !bodyOk || !bodyNoSora) {
    console.error("VERIFICATION FAILED");
    process.exit(1);
  }
  console.log("VERIFICATION PASSED");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
