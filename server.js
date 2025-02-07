// Imports
const express = require("express");
const env = require("dotenv").config();
const app = express();

// Local Server Information
const port = process.env.PORT;
const host = process.env.HOST;

// Routes
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

//Production Live Server
app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
