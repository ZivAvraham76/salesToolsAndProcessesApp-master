const _ = require("lodash");
// App Services
const {
  getUserId,
  getTrainingId,
  getCourseIdInLearningPath,
  getUserCourseData,
  getUserTrainingData,
  getCourseDetails
} = require("../services/litmosService");

const URL_PREFIX = process.env.LMS_COURSE_PATH_URL;

class Lms {
  async getTrainingData(username, learningPathName) {
    try {
      const learningPathInfo = await getTrainingId(learningPathName);
      // console.log("LP", learningPathInfo)
      const coursesInLearningPath = await getCourseIdInLearningPath(
        learningPathInfo.Id
      );
      // console.log("coursesInLearningPath", coursesInLearningPath);

      const lmsUserId = await getUserId(username);
      const trainingData = await this.#getModules(
        lmsUserId,
        coursesInLearningPath
      );

      // console.log("trainingData", trainingData);

      const data = trainingData.flatMap((course) =>
        course.Modules.map((module) => ({
          id: module.Id,
          adsm: module.Code,
          name: module.Name,
          originalid: module.OriginalId,
          completed: module.Completed,
          course: _.split(course.Name, "|", 2)[0],
          courseDescription: course.Description,
          CourseImageURL: course.CourseImageURL,
          courseId: course.Id,
          coursePercentageComplete: course.PercentageComplete,
          cid: course.Id,
          coriginalid: course.OriginalId,
          StartDate: module.StartDate,
          Score: module.Score,  
          accessUrl: `${URL_PREFIX}${course.OriginalId}/module/${module.OriginalId}?LPid=0`,
        }))
      );

      console.log("data", data);

      return data;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  // async getOnboardingData(username, onboardingList) {
  //   try {
  //     // console.log("🎯 its working !");
  //     const lmsUserId = await getUserId(username);
  //     const userTrainingData = await getUserTrainingData(lmsUserId);
  //     // console.log("userTrainingData", userTrainingData);
  //     const updatedOnboardingList = await this.#updateDataStructure(
  //       userTrainingData,
  //       onboardingList
  //     );

  //     // console.log("updatedOnboardingList", updatedOnboardingList);
  //     return updatedOnboardingList;
  //   } catch (err) {
  //     console.log(err);
  //     return undefined;
  //   }
  // }
  

  // async #updateDataStructure(userTrainingData, onboardingList) {
  //   const filteredAndUpdated = onboardingList
  //     .map((element) => {
  //       let productTraining = userTrainingData[0].find(
  //         (e) => e.Name === element.Title
  //       );
  
  //       if (!productTraining) {
  //         productTraining = userTrainingData[1].find(
  //           (e) => e.Name === element.Title
  //         );
  //       }
  
  //       if (!productTraining) {
  //         return null; 
  //       }
  
  //       return {
  //         ...element,
  //         Id: productTraining.Id,
  //         PercentageComplete: productTraining.PercentageComplete,
  //         litmosLearningPathUrl: `${productTraining.CourseCreatedDate
  //           ? process.env.LMS_COURSE_PATH_URL
  //           : process.env.LMS_LEARNING_PATH_URL
  //         }${productTraining.OriginalId}`
  //       };
  //     })
  //     .filter(Boolean); 
  
  //   console.log("onboardingListfilterd", filteredAndUpdated[0]);
  //   return filteredAndUpdated[0];
  // }
  

  // Private methods



  async #getModules(lmsUserId, coursesInLearningPath) {
    // console.log("coursesInLearningPath", coursesInLearningPath);
    const coursesModulesArray = await Promise.all(
      coursesInLearningPath.map(async({ Id, Description }) => {
        let userCourseData = await getUserCourseData(lmsUserId, Id);
        const courseDetails = await getCourseDetails(Id);
        
        userCourseData.Description = Description;
        userCourseData.CourseImageURL = courseDetails.CourseImageURL;
        return userCourseData;
      })
    );
    // console.log("userCourseData", coursesModulesArray);
    
    const filteredCoursesModulesArray = coursesModulesArray.filter(course => course !== undefined);
    // console.log(filteredCoursesModulesArray); 
    return filteredCoursesModulesArray.map(({ Id, Name, OriginalId, Description, CourseImageURL, PercentageComplete, Modules }) => {
      return {
        Id,
        Name,
        OriginalId,
        Description,
        CourseImageURL,
        PercentageComplete,
        Modules: Modules.map(({ Id, Code, Name, Completed, OriginalId, StartDate, Score }) => {
          return {
            Id: Id,
            Code: Code,
            Name: Name,
            Completed: Completed,
            OriginalId: OriginalId,
            StartDate: StartDate,
            Score: Score,
          };
        }),
      };
    });
  }
}

const lms = new Lms();

module.exports = lms;
