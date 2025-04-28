const path = require("path");
require("dotenv").config({
  override: true,
  path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`),
});
const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
// App Routers
const getLpData = require("./routers/lmsRoute");
const staticFilesRouter = require("./routers/staticFiles");
const CustomePagesRouter = require("./routers/customePages");
// App Services
const retrieveSecrets = require("./services/awsSecretsService");

// Middlewares
const { validateBearerToken } = require("./middlewares/validateBearerToken");

const port = process.env.PORT || "3000";

// Best Practices Security
// app.use(
//   cors({
//     origin: [process.env.POST_LOGIN_REDIRECT],
//     methods: "GET",
//   })
// );

// app.disable("x-powered-by");

// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

app.get("/health-check-path", (req, res) => {
  res.status(200).send("ok");
});

async function run() {
  try {
    // await retrieveSecrets();

    // Before we can contine with the code we need to retrive the app secret from awsSecret
    const MicrosoftId = require("./models/MicrosoftId");
    const AuthRouter = require("./routers/auth");

   // Using express-session middleware 
    app.use(
      session({
        secret: process.env.EXPRESS_SESSION_SECRET, // Enter secret here
        name: "sessionId",
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false, // Set this to ture on production
        },
      })
    );

     // Whitelist of allowed domains
     const allowedDomains = [
      `http://localhost:3000`,
      `http://localhost:5173`,
      `https://mosh12.sharepoint.com`,
      `https://mosh12-admin.sharepoint.com`,
      `https://trainingportal-dev.checkpoint.com/`,
      `https://trainingportal.checkpoint.com/`,
      `https://login.microsoftonline.com`,
    ];

    const corsOption = {
      origin: (origin, callback) => {
        if (!origin || allowedDomains.includes(origin)) {
          console.log(`Origin ${origin} is allowed`);
          callback(null, true); // Allow request
        } else {
          callback(new Error(`Not allowed by CORS`)); // Block request
        }
      },
      methods: ["GET", "POST"],
    };

    // Best Practices Security
    app.use(cors(corsOption));


    app.disable("x-powered-by");

    // Custom header for specific security headers
    app.use((req, res, next) => {

      // Content-Security-Policy for clickjacking prevention
      res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");

      // HSTS (Strict-Transport-Security)
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
      );

      // X-Content-Type-Options
      res.setHeader("X-Content-Type-Options", "nosniff");

      next();
    });

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    // Instantiate the wrapper
    const msid = MicrosoftId;

    // Initialize the wrapper
    app.use(msid.initialize());

    // Change to app.use("/auth/",AuthRouter) and update the clients urls
    app.use("/", AuthRouter);

    app.use("/sp-data", validateBearerToken, getLpData);

    // Checks if authenticated via session
    // app.use(msid.isAuthenticated());

    // app.use("/lp", getLpData);

    // app.use("/", staticFilesRouter);

    // Change to app.use("/pages/",CustomePagesRouter) and update the clients urls
    app.use("/", CustomePagesRouter);
  } catch (err) {
    console.log(err);
  }
}

run();

app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});
