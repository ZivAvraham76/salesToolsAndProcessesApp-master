const _ = require("lodash");
// App Services
const {
  getUserId,
  getTrainingId,
  getCourseIdInLearningPath,
  getUserCourseData,
  getUserTrainingData
} = require("../services/litmosService");

const URL_PREFIX = process.env.LMS_COURSE_PATH_URL;

class Lms {
  async getTrainingData(username, learningPathName) {
    try {
      const learningPathInfo = await getTrainingId(learningPathName);
      console.log("name", learningPathName)
      const coursesInLearningPath = await getCourseIdInLearningPath(
        learningPathInfo.Id
      );
      const lmsUserId = await getUserId(username);
      const trainingData = await this.#getModules(
        lmsUserId,
        coursesInLearningPath
      );

      const data = trainingData.flatMap((course) =>
        course.Modules.map((module) => ({
          id: module.Id,
          adsm: module.Code,
          name: module.Name,
          originalid: module.OriginalId,
          completed: module.Completed,
          course: _.split(course.Name, "|", 2)[0],
          cid: course.Id,
          coriginalid: course.OriginalId,
          accessUrl: `${URL_PREFIX}${course.OriginalId}/module/${module.OriginalId}?LPid=0`,
        }))
      );

      return data;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async getOnboardingData(username, onboardingList) {
    try {
      // console.log("🎯 its working !");
      const lmsUserId = await getUserId(username);
      const userTrainingData = await getUserTrainingData(lmsUserId);
      // console.log("userTrainingData", userTrainingData);
      const updatedOnboardingList = await this.#updateDataStructure(
        userTrainingData,
        onboardingList
      );

      // console.log("updatedOnboardingList", updatedOnboardingList);
      return updatedOnboardingList;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }
  

  async #updateDataStructure(userTrainingData, onboardingList) {
    const filteredAndUpdated = onboardingList
      .map((element) => {
        let productTraining = userTrainingData[0].find(
          (e) => e.Name === element.Title
        );
  
        if (!productTraining) {
          productTraining = userTrainingData[1].find(
            (e) => e.Name === element.Title
          );
        }
  
        if (!productTraining) {
          return null; 
        }
  
        return {
          ...element,
          Id: productTraining.Id,
          PercentageComplete: productTraining.PercentageComplete,
          litmosLearningPathUrl: `${productTraining.CourseCreatedDate
            ? process.env.LMS_COURSE_PATH_URL
            : process.env.LMS_LEARNING_PATH_URL
          }${productTraining.OriginalId}`
        };
      })
      .filter(Boolean); 
  
    console.log("onboardingListfilterd", filteredAndUpdated[0]);
    return filteredAndUpdated[0];
  }
  

  // Private methods

  async #getModules(lmsUserId, coursesInLearningPath) {
    const coursesModulesArray = await Promise.all(
      coursesInLearningPath.map(({ Id }) => {
        return getUserCourseData(lmsUserId, Id);
      })
    );
    console.log(coursesModulesArray);
    const filteredCoursesModulesArray = coursesModulesArray.filter(course => course !== undefined);

    return filteredCoursesModulesArray.map(({ Id, Name, OriginalId, Modules }) => {
      return {
        Id,
        Name,
        OriginalId,
        Modules: Modules.map(({ Id, Code, Name, Completed, OriginalId }) => {
          return {
            Id: Id,
            Code: Code,
            Name: Name,
            Completed: Completed,
            OriginalId: OriginalId,
          };
        }),
      };
    });
  }
}

const lms = new Lms();

module.exports = lms;
