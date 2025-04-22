const _ = require("lodash");
// App Utilities
const fetch = require("../utilities/fetch");

/* internal functions */

/* getUserId function will retrive the user litmos id */
exports.getUserId = async (username) => {
  const response = await fetch(
    `/users?search=${username}&source=null&limit=1000&format=json&showInactive=false`
  );

  if (!response[0]) {
    throw new Error("Failed to get user litmos id");
  }

  return response[0].Id;
};

/*  this function will update the default Data.json file with the user courses and learning path information */
exports.getUserTrainingData = async (userId) => {
  const userTrainingData = [];

  userTrainingData.push(getUserLearningPathData(userId));
  userTrainingData.push(getUserCourseData1(userId));

  const trainingData = await Promise.all(userTrainingData);
  trainingData.forEach((element) => {
    if (!element) throw new Error("Training data is not available!");
  });

  return trainingData;
};

async function getUserLearningPathData(lmsUserId) {
  const userLearningPatshData = await fetch(
    `/users/${lmsUserId}/learningpaths?source=null&format=json&limit=1000`
  ); // We assume that user will not be register to more then 1000 learning paths

  if (!userLearningPatshData) return undefined;

  return userLearningPatshData;
}

async function getUserCourseData1(lmsUserId) {
  const userCoursesData = await fetch(
    `/users/${lmsUserId}/courses?source=null&format=json&limit=1000`
  ); // We assume that user will not be register to more then 1000 learning paths
  if (!userCoursesData) return undefined;

  console.log("userCoursesData", userCoursesData);

  return userCoursesData;
}

exports.getUserCourseData = async (lmsUserId, courseId) => {
  const userCourseData = await fetch(
    `/users/${lmsUserId}/courses/${courseId}?source=null&format=json&limit=1000`
  );
  if (!userCourseData) return undefined;
  // console.log("useID",lmsUserId);
  return userCourseData;
};


exports.getTrainingId = async (trainingName) => {
  try {
    const trainingData = await findTrainingDetail(trainingName);
    // trainingData[0] => learningPath ; trainingData[1] => courses

    if (trainingData[0].length == 1) {
      const { Id, OriginalId } = trainingData[0][0];
      return { Id, OriginalId, type: 0 };
    } else if (trainingData[1].length == 1) {
      const { Id, OriginalId } = trainingData[1][0];
      return { Id, OriginalId, type: 1 };
    } else {
      throw new Error(
        `Cloud not succeed to get training Id for training ${trainingName}!`
      );
    }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

async function findTrainingDetail(trainingName) {
  const trainingData = []; // trainingData[0] => learningPath ; trainingData[1] => courses

  trainingData.push(getLearningPathsDetail(trainingName));
  trainingData.push(getCoursesDetail(trainingName));

  const listOfTraining = await Promise.all(trainingData);

  listOfTraining.forEach((element) => {
    if (!element) throw new Error("Could not succeed to get list of training!");
  });

  console.log("listOfTraining", listOfTraining);

  return listOfTraining;
}

async function getLearningPathsDetail(trainingName) {
  const listOfLearningPaths = await fetch(
    `/learningpaths?search=${encodeURIComponent(
      trainingName
    )}&source=null&format=json&limit=1000`
  );

  if (!listOfLearningPaths) return undefined;

  return listOfLearningPaths;
}

async function getCoursesDetail(trainingName) {
  const listOfCourses = await fetch(
    `/courses?search=${encodeURIComponent(
      trainingName
    )}&source=null&format=json&limit=1000`
  );

  if (!listOfCourses) return undefined;

  return listOfCourses;
}

exports.assignCourseToUser = async (userId, courseId) => {
  const httpBody = [{ Id: courseId }];
  // POST /users/{userid}/courses?
  const response = await fetch(
    `/users/${userId}/courses?source=null&format=json&limit=1000&sendmessage=false`,
    "POST",
    httpBody
  );
};

exports.assignLearningPathToUser = async (userId, learningPathId) => {
  const httpBody = [{ Id: learningPathId }];
  // POST /users/{userid}/learningpaths?
  const response = await fetch(
    `/users/${userId}/learningpaths?source=null&format=json&limit=1000&sendmessage=false`,
    "POST",
    httpBody
  );
};

exports.getCourseIdInLearningPath = async (lpId) => {
  try {
    const courses = await fetch(
      `/learningpaths/${lpId}/courses?source=null&format=json`
    );
    // console.log("courses", courses);

    if (courses === undefined)
      throw new Error(
        `Cloud not succeed to get courses in training id ${lpId}!`
      );

    return _(courses)
      .chunk(1)
      .map((e) => {
        return e[0];
      })
      .map(({ Id,Description}) => {
        return {
          Id: Id,
          Description: Description,
        };
      })
      .value();
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

exports.getCourseDetails = async (courseId) => {
  const response = await fetch(
    `/courses/${courseId}/details?source=null&format=json`
  );

  if (!response) {
    throw new Error(`Failed to get course details for course ${courseId}`);
  }

  return response;
};

exports.getUserLearningPathDetails = async (userId, learningPathId) => {
  const response = await fetch(
    `/users/${userId}/learningpaths/${learningPathId}?source=null&format=json`
  );
  if (!response) {
    throw new Error(`Failed to get user-specific learning path details for ${learningPathId}`);
  }
  return response;
};



// technical training

/* getLearningPathsCourses function will return all the courses that in the learning path */
exports.getLearningPathsCourses = async (lpId) => {
  try {
    // debug("Learning Path Id:", lpId);
    const learningPathCourses = await fetch(
      `/learningpaths/${lpId}/courses?source=null&format=json&limit=1000`
    );
    // debug("learningPathCourses:", learningPathCourses);
    if (learningPathCourses.length === undefined) return undefined;
 
    return learningPathCourses;
  } catch (error) {
    return undefined;
  }
};
