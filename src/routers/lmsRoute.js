const express = require("express");
const router = express.Router();
// App Controllers
const lmsController = require("../controllers/lmsController");

// The below endpoint will be available only of the user is authenticated
router.get("/:lpName", lmsController.getTrainingData);


// The below endpoint will be available only of the user is authenticated
router.get("/4sp/:lpName", lmsController.getTrainingDataSP);


// router.post("/4sp/onboarding", lmsController.getOnboardingData);


module.exports = router;
