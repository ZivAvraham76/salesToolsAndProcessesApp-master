const _ = require("lodash");
// App Services
const {
  getUserId,
  getTrainingId,
  getCourseIdInLearningPath,
  getUserCourseData,
  getUserTrainingData,
  getCourseDetails,
  getUserLearningPathDetails
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
      const userLearningPathDetails = await getUserLearningPathDetails(lmsUserId, learningPathInfo.Id);
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

      // console.log("data", data);

      return {
        modules: data,
        learningPath: userLearningPathDetails 
      };
  
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }


  // Private methods



  async #getModules(lmsUserId, coursesInLearningPath) {
    // console.log("coursesInLearningPath", coursesInLearningPath);
    const coursesModulesArray = await Promise.all(
      coursesInLearningPath.map(async({ Id, Description }) => {
        let userCourseData = await getUserCourseData(lmsUserId, Id);
        const courseDetails = await getCourseDetails(Id);
        
        userCourseData.Description = Description;
        userCourseData.CourseImageURL = courseDetails.CourseImageURL;

        console.log("userCourseData", userCourseData);
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
