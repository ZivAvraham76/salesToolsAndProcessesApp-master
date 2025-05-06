const express = require("express");
const router = express.Router();


// App Controllers
const lmsController = require("../controllers/lmsController");

// sales tool routers:

// The below endpoint will be available only of the user is authenticated
// router.get("/:lpName", lmsController.getTrainingData);

// get popup data
router.get("/4sp/courses/:courseId", lmsController.getCourseAndLpDetails);

// get learningpath data (for onboarding and sales tools)
router.get("/4sp/:lpId", lmsController.getTrainingDataSP);

// get user data (for technical training)
router.post("/4sp", lmsController.postTrainingData);



module.exports = router;
