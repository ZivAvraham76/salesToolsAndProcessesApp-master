const express = require("express");
const router = express.Router();
const path = require("path");
// App Models
const MicrosoftId = require("../models/MicrosoftId");
const appSettings = require("../appSettings");
const axios = require("../utilities/useAxios");

const publicPath = path.join(__dirname, "..", "public");
const msid = MicrosoftId;

router.get("/", async (req, res) => {
  const isAuthenticated = req.session.isAuthenticated;
  if (isAuthenticated) {
    // Gets the static files from the build folder
    res.sendFile(path.join(publicPath, "index.html"));
  } else {
    res.redirect("/signin");
  }
});

router.get(
  "/signin",
  msid.signIn({
    postLoginRedirect: process.env.POST_LOGIN_REDIRECT,
    failureRedirect: "/",
  })
);

router.get(
  "/signout",
  msid.signOut({
    postLogoutRedirect: process.env.POST_LOGIN_REDIRECT,
  })
);

router.get(
  "/profile",
  msid.isAuthenticated(),
  msid.getToken({
    resource: {
      endpoint: "https://graph.microsoft.com/v1.0/me",
      scopes: ["User.Read.All"],
    },
  }),
  async (req, res, next) => {
    const response = await axios("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${req.session.protectedResources.graphAPI.accessToken}`,
      },
    });

    res.redirect("/");
  }
);

module.exports = router;
