import { Hono } from "hono";
import scrapeAmazon from "./scraper.js"; // Ensure scraper.js is adapted for Workers

const app = new Hono();

// Load product data from JSON (replace with database if needed)
const products = JSON.parse(
  await (await fetch("https://discount-catalog.com/products.json")).text()
);

app.get("/", (c) => {
  const url = new URL(c.req.url);
  const search = url.searchParams.get("search")?.toLowerCase() || "";
  const maxPrice = url.searchParams.get("maxPrice")
    ? parseFloat(url.searchParams.get("maxPrice"))
    : null;
  const department = url.searchParams.get("department") || "";

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search) &&
      (maxPrice === null ||
        parseFloat(p.price.replace(/[^0-9.]/g, "")) <= maxPrice) &&
      (department === "" ||
        p.department.toLowerCase() === department.toLowerCase())
  );

  return c.render("index", {
    products: filteredProducts,
    search,
    maxPrice,
    department,
  });
});

// Deals Route - Pre-filtered by price
app.get("/deals/:maxPrice", (c) => {
  const maxPrice = parseFloat(c.req.param("maxPrice"));
  const filteredProducts = products.filter(
    (p) => parseFloat(p.price.replace(/[^0-9.]/g, "")) <= maxPrice
  );

  return c.render("index", {
    products: filteredProducts,
    search: "",
    maxPrice,
    department: "",
  });
});

// Scraper Route - Cloudflare Workers Compatible
app.get("/scrape", async (c) => {
  const url = new URL(c.req.url).searchParams.get("url");
  if (!url) return c.text("Product URL is required", 400);

  try {
    const productData = await scrapeAmazon(url);
    return c.json(productData);
  } catch (error) {
    console.error("Scraping error:", error);
    return c.text("Error scraping data", 500);
  }
});

// Static Pages
app.get("/about", (c) => c.render("about"));
app.get("/contact", (c) => c.render("contact"));
app.get("/privacy", (c) => c.render("privacy"));

export default app;
