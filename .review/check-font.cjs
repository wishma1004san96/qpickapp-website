const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector("#experience-qpick-heading");

  const info = await page.evaluate(async () => {
    const h = document.querySelector("#experience-qpick-heading");
    const body = document.querySelector(".experience-body p");
    await document.fonts.ready;
    await document.fonts.load('400 104px "Instrument Serif"');
    await document.fonts.load('400 30px "Inter"');

    const hs = getComputedStyle(h);
    const bs = getComputedStyle(body);
    const varVal = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-instrument-serif")
      .trim();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const text = "Experience Q Pick";
    function w(ff) {
      ctx.font = "400 100px " + ff;
      return ctx.measureText(text).width;
    }
    const wInst = w('"Instrument Serif"');
    const wCorm = w('"Cormorant Garamond"');
    const wTimes = w('"Times New Roman"');
    const wComp = w(hs.fontFamily);

    const forbidden = /Cormorant|Didot|Bodoni|Playfair|DM Serif|Times|Georgia/i;
    return {
      headline: {
        fontFamily: hs.fontFamily,
        fontSize: hs.fontSize,
        fontWeight: hs.fontWeight,
        lineHeight: hs.lineHeight,
        letterSpacing: hs.letterSpacing,
        fontKerning: hs.fontKerning,
      },
      body: {
        fontFamily: bs.fontFamily,
        fontSize: bs.fontSize,
        letterSpacing: bs.letterSpacing,
      },
      varVal,
      checkInst: document.fonts.check('400 104px "Instrument Serif"'),
      matchInst: Math.abs(wComp - wInst) < 1,
      matchCorm: Math.abs(wComp - wCorm) < 1,
      matchTimes: Math.abs(wComp - wTimes) < 1,
      stackHasForbidden: forbidden.test(hs.fontFamily) || forbidden.test(varVal),
      primaryIsInstrument: /^["']?Instrument Serif/.test(hs.fontFamily.trim()),
    };
  });

  console.log(JSON.stringify(info, null, 2));

  const ok =
    info.primaryIsInstrument &&
    info.matchInst &&
    !info.stackHasForbidden &&
    info.checkInst &&
    info.headline.fontWeight === "400";

  if (!ok) {
    console.error("FONT VERIFICATION FAILED");
    process.exit(1);
  }
  console.log("FONT VERIFICATION PASSED");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
