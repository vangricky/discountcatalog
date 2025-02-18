const puppeteer = require("puppeteer");

async function scrapeAmazon(url) {
  const browser = await puppeteer.launch({ headless: "false" });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Extract product details
  const productData = await page.evaluate(() => {
    const name =
      document.querySelector("#productTitle")?.innerText.trim() || "No title";
    const price =
      document.querySelector(".a-price .a-offscreen")?.innerText || "No price";
    const discountPercent =
      document.querySelector(".savingsPercentage")?.innerText || "No discount";
    const image =
      document.querySelector("#imgTagWrapperId img")?.src || "No image";
    const department =
      document.querySelector("#nav-subnav .nav-a-content")?.innerText ||
      "Unknown department";

    return { name, price, discountPercent, image, department };
  });

  await browser.close();
  return productData;
}

// Test the scraper with an Amazon product URL
scrapeAmazon("https://www.amazon.com/dp/B08F2R6BXY")
  .then((data) => console.log(data))
  .catch((err) => console.error("Error:", err));

module.exports = scrapeAmazon;
