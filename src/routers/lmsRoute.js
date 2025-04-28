const express = require("express");
const router = express.Router();


// App Controllers
const lmsController = require("../controllers/lmsController");

// sales tool routers:

// The below endpoint will be available only of the user is authenticated
// router.get("/:lpName", lmsController.getTrainingData);


// The below endpoint will be available only of the user is authenticated
router.get("/4sp/:lpId", lmsController.getTrainingDataSP);


// technial training routers:

router.post("/4sp", lmsController.postTrainingData);

// get popup data
router.get("/4sp/courses/:courseId", lmsController.getCourseAndLpDetails);

module.exports = router;
