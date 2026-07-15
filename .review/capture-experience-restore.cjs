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
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
  await page.waitForSelector("#experience-qpick-heading");

  await page.evaluate(() => {
    const heading = document.querySelector("#experience-qpick-heading");
    const section = heading?.closest("section");
    const header = document.querySelector("header");
    if (header) header.style.visibility = "hidden";
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - 24));
  });
  await new Promise((r) => setTimeout(r, 900));

  const metrics = await page.evaluate(() => {
    const heading = document.querySelector("#experience-qpick-heading");
    const section = heading?.closest("section");
    const phone = section?.querySelector(".experience-phone-parallax");
    return {
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      heading: heading?.textContent?.replace(/\s+/g, " ").trim(),
      phoneH: phone ? Math.round(phone.getBoundingClientRect().height) : 0,
      badges: section?.querySelectorAll(".experience-store-badge").length ?? 0,
    };
  });
  console.log(metrics);

  const heading = await page.$("#experience-qpick-heading");
  const sectionHandle = await heading.evaluateHandle((el) =>
    el.closest("section"),
  );
  const section = sectionHandle.asElement();
  await section.screenshot({
    path: path.join(__dirname, "experience-restored-desktop.png"),
  });

  await page.setViewport({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
  await page.waitForSelector("#experience-qpick-heading");
  await page.evaluate(() => {
    const heading = document.querySelector("#experience-qpick-heading");
    const section = heading?.closest("section");
    const header = document.querySelector("header");
    if (header) header.style.visibility = "hidden";
    section?.scrollIntoView({ block: "start" });
  });
  await new Promise((r) => setTimeout(r, 700));
  const heading2 = await page.$("#experience-qpick-heading");
  const sectionHandle2 = await heading2.evaluateHandle((el) =>
    el.closest("section"),
  );
  await sectionHandle2.asElement().screenshot({
    path: path.join(__dirname, "experience-restored-mobile.png"),
  });

  console.log("wrote screenshots");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
