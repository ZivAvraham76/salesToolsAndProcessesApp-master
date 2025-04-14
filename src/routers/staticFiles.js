const express = require("express");
const router = express.Router();
const path = require("path");

// App Services
const { S3GetPresignedUrl } = require("../services/awsS3Service");

// Serve static files
router.get("/*/:filename", getSignedUrlFromS3);

async function getSignedUrlFromS3(req, res) {
  const file = req.originalUrl.substring(1);
  const redirectUrl = await S3GetPresignedUrl(file);
  res.set({ Location: redirectUrl });
  res.sendStatus(303);
}

module.exports = router;
