const express = require("express");
const app = express();
const fs = require("fs");
const PORT = process.env.PORT || 3000;
const scrapeAmazon = require("./scraper");

app.set("view engine", "ejs");
app.use(express.static("public"));

// Load product data
const products = JSON.parse(fs.readFileSync("products.json", "utf-8"));

app.get("/", (req, res) => {
  let search = req.query.search ? req.query.search.toLowerCase() : "";
  let maxPrice = req.query.deals ? parseFloat(req.query.deals) : null; // Use 'deals' instead of 'maxPrice'
  let department =
    req.query.department && req.query.department !== "All Departments"
      ? req.query.department.toLowerCase()
      : "";

  let filteredProducts = products.filter((p) => {
    let priceNumber = parseFloat(p.price.replace(/[^0-9.]/g, "")); // Convert price string to number
    return (
      p.name.toLowerCase().includes(search) &&
      (maxPrice === null || priceNumber <= maxPrice) &&
      (department === "" || p.department.toLowerCase() === department)
    );
  });

  filteredProducts = filteredProducts.sort(() => Math.random() - 0.5);

  res.render("index", {
    products: filteredProducts,
    search,
    maxPrice,
    department,
  });
});

// Deals Route - Pre-filtered by price
app.get("/deals/:maxPrice", (req, res) => {
  const maxPrice = parseFloat(req.params.maxPrice);
  const filteredProducts = products.filter((p) => {
    const priceNumber = parseFloat(p.price.replace(/[^0-9.]/g, ""));
    return priceNumber <= maxPrice;
  });

  res.render("index", {
    products: filteredProducts,
    search: "",
    maxPrice,
    department: "",
  });
});

app.get("/sitemap.xml", (req, res) => {
  res.sendFile(__dirname + "/sitemap.xml", (err) => {
    if (err) {
      console.error("Error serving sitemap:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

// scraper.js - puppetter
app.get("/scrape", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Product URL is required");
  try {
    const productData = await scrapeAmazon(url);
    res.json(productData);
  } catch (error) {
    console.error("Scraping error:", error); // Logs the actual error
    res.status(500).send("Error scraping data");
  }
});

// About & Contact Pages
app.get("/about", (req, res) => res.render("about"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/privacy", (req, res) => {
  res.render("privacy");
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
