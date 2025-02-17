const express = require("express");
const app = express();
const fs = require("fs");
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));

// Load product data
const products = JSON.parse(fs.readFileSync("products.json", "utf-8"));

app.get("/", (req, res) => {
  let search = req.query.search ? req.query.search.toLowerCase() : "";
  let maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

  let filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search) &&
      (maxPrice === null || p.price <= maxPrice)
  );

  res.render("index", { products: filteredProducts, search, maxPrice });
});

// Pre-filtered routes for specific price categories
app.get("/deals/:maxPrice", (req, res) => {
  const maxPrice = parseFloat(req.params.maxPrice);
  const filteredProducts = products.filter((p) => p.price <= maxPrice);
  res.render("index", { products: filteredProducts, search: "", maxPrice });
});

app.get("/about", (req, res) => res.render("about"));
app.get("/contact", (req, res) => res.render("contact"));

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
