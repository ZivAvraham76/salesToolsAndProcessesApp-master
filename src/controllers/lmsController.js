const LmsModel = require("../models/LmsModel");

//sales tool 

// exports.getTrainingData = async function (req, res, next) {
//   const username = req.session.account.username;
//   const learningPathName = req.params.lpName;
//   const data = await LmsModel.getTrainingData(username, learningPathName);

//   if (!data) return res.status(500).send({});

//   res.send({ data });
// };

exports.getTrainingDataSP = async function (req, res) {

  const { username} = req.user;

    const learningPathId = req.params.lpId;

  const data = await LmsModel.getTrainingData(username, learningPathId);


  if (!data) return res.status(500).send([]);
  res.send({data});
};



// technical training

exports.postTrainingData = async function (req, res) {
  try {


    const { username } = req.user;
    if (!username) {
      return res.status(401).json({ error: "Unauthorized" });
    }
 
    const requestData = req.body; // Get the data sent by the frontend
 
 
    // console.log(username);
    // const username = "mosheas@checkpoint.com";
    const data = await LmsModel.getUserTrainingData(username, requestData);
 
    if (!data) {
      return res.status(500).send({ error: "Failed to retrieve training data" });
    }
 
    const responseData = {
      user: {
        userBadgesPointsData: data.userBadgesPointsData,
      },
      producttraining: data.userTrainingData,
    };
    // const trialData = await LmsModel.getTrainingDataAndCoursesDetails(username,requestData)
   
 
    res.send(responseData);
 
    // res.json(responseData);
  } catch (error) {
    console.error("Error fetching training data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getCourseAndLpDetails = async function (req, res) {
  try {

    const { username} = req.user;
  if (!username) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const courseId = req.params.courseId; // Get course ID from the URL
    // console.log("Course ID:", courseId);
    // console.log("User Name:", username);
    if (!username) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }
 

  
    // Fetch course details using the ID
    const courseDetails = await LmsModel.getCourseResults(username, courseId);
    res.json(courseDetails);
    
  } catch (error) {
    console.log("the error is from here")
    console.error(error.stack);
 
    res.status(500).json({ error: "Failed to fetch course details" });
  }
}