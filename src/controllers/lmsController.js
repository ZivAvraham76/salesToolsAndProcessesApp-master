const LmsModel = require("../models/LmsModel");

exports.getTrainingData = async function (req, res, next) {
  const username = req.session.account.username;
  const name = req.session.account.name;
  const learningPathName = req.params.lpName;
  const data = await LmsModel.getTrainingData(username, learningPathName);

  if (!data) return res.status(500).send({});

  res.send({ data, name });
};

exports.getTrainingDataSP = async function (req, res) {
  const username = (req.user = `ziv@mosh12.onmicrosoft.com`)
    ? "ziva@checkpoint.com"
    : `field`;
    const name = req.user.given_name;
    const learningPathName = req.params.lpName;
    // console.log(learningPathName);
    // console.log(username);
  // const username = "mosheas@checkpoint.com";
  const data = await LmsModel.getTrainingData(username, learningPathName);


  if (!data) return res.status(500).send([]);
  res.send({data,name});
};

// exports.getOnboardingData = async function (req, res) {
//   console.log("🎯 getOnboardingData CALLED!");
//   // console.log("req.body:", req.body);
//   // console.log("req.session:", req.session);
//   const username = (req.user = `MosheAshkenazi@mosh12.onmicrosoft.com`)
//       ? "mosheas@checkpoint.com"
//       : `field`;
//     if (!username) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }
 
//   const onboardingList = req.body;
//   const data = await LmsModel.getOnboardingData(username, onboardingList);
//   // console.log("data", data);

//   if (!data) return res.status(500).send({});

//   res.send(data);
// }