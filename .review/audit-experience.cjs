const puppeteer = require("puppeteer-core");

const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    defaultViewport: { width: 1440, height: 900 },
    args: ["--hide-scrollbars"],
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page.waitForSelector("#experience-qpick-heading");

  const desktop = await page.evaluate(() => {
    const section = document
      .querySelector("#experience-qpick-heading")
      .closest("section");
    const phone = section.querySelector(
      '[aria-label^="Q Pick app preview"]',
    );
    const sr = section.getBoundingClientRect();
    const pr = phone.getBoundingClientRect();
    const cs = getComputedStyle(phone);
    const copy = section.querySelector(".order-1");
    const cr = copy.getBoundingClientRect();
    return {
      section: { w: +sr.width.toFixed(1), h: +sr.height.toFixed(1) },
      phone: {
        w: +pr.width.toFixed(1),
        h: +pr.height.toFixed(1),
        ratio: +(pr.height / pr.width).toFixed(3),
      },
      phoneCss: { w: cs.width, h: cs.height },
      copy: { w: +cr.width.toFixed(1), h: +cr.height.toFixed(1) },
      gapCopyPhone: +(pr.left - cr.right).toFixed(1),
      rightGutter: +(sr.right - pr.right).toFixed(1),
      sectionOverflow: getComputedStyle(section).overflow,
    };
  });
  console.log("DESKTOP", JSON.stringify(desktop, null, 2));

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.reload({ waitUntil: "networkidle2" });
  await page.waitForSelector("#experience-qpick-heading");

  const mobile = await page.evaluate(() => {
    const section = document
      .querySelector("#experience-qpick-heading")
      .closest("section");
    const phone = section.querySelector(
      '[aria-label^="Q Pick app preview"]',
    );
    const heading = document.querySelector("#experience-qpick-heading");
    const storeWrap = section.querySelector(".order-3");
    const pr = phone.getBoundingClientRect();
    const hr = heading.getBoundingClientRect();
    const vs = storeWrap.getBoundingClientRect();
    return {
      phone: {
        w: +pr.width.toFixed(1),
        h: +pr.height.toFixed(1),
        ratio: +(pr.height / pr.width).toFixed(3),
      },
      gapHeadingPhone: +(pr.top - hr.bottom).toFixed(1),
      gapPhoneStores: +(vs.top - pr.bottom).toFixed(1),
      sectionH: +section.getBoundingClientRect().height.toFixed(1),
      storeDisplay: getComputedStyle(storeWrap).display,
    };
  });
  console.log("MOBILE", JSON.stringify(mobile, null, 2));

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
