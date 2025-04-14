const express = require("express");
const router = express.Router();
const path = require("path");
const publicPath = path.join(__dirname, "..", "/public");

// custom 401 - Unauthorized
router.get("/unauthorized", (req, res) =>
  res.status(401).sendFile(path.join(publicPath, "401.html"))
);

// custom 404
router.get("*", (req, res) => {
  res.status(404).sendFile(path.join(publicPath, "404.html"));
});

module.exports = router;
