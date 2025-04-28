const _ = require("lodash");
// App Services
const {
  getUserId,
  getTrainingId,

  // getCourseIdInLearningPath,
  getUserCourseData,
  getUserTrainingData,
  getCourseDetails,
  getUserLearningPathDetails,
  getLearningPathsCourses,
  getLearningPathDetails,
} = require("../services/litmosService");
const e = require("express");

const URL_PREFIX = process.env.LMS_COURSE_PATH_URL;

class Lms {
  constructor() {
    this.userIdCache = {};
  }

  async getCachedUserId(username) {
    if (this.userIdCache[username]) {
      return this.userIdCache[username];
    }
    const userId = await getUserId(username);
    this.userIdCache[username] = userId;
    return userId;
  }


  // Get all data for sales tools

  async getTrainingData(username, learningPathId) {
    try {
      // const learningPathInfo = await getTrainingId(learningPathName);
      const coursesInLearningPath = await getLearningPathsCourses(
        learningPathId
      );

      const lmsUserId = await this.getCachedUserId(username);
      const userLearningPathDetails = await getUserLearningPathDetails(lmsUserId, learningPathId);
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

// Get all data for technical training

async getUserTrainingData(username, BaseLineData) {
  try {
    // console.log("username", username);
    const lmsUserId = await this.getCachedUserId(username);
    const userTrainingData = await getUserTrainingData(lmsUserId);


    const data = await this.#updateDataStructure(
      userTrainingData,
      BaseLineData
    );
    return {
      userTrainingData: data,
      userBadgesPointsData: [],
    };
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

// Get data for specific training object (for technical trainig popup)

async getCourseResults(username, course) {
  try {
   
    const lmsUserId = await this.getCachedUserId(username);
    const learningPathsCourses = await getLearningPathsCourses(course);
    // console.log("Learning Paths Courses:", learningPathsCourses);

    if (!learningPathsCourses || learningPathsCourses.length === 0) {
      return [await this.#getCourse(lmsUserId, course)];
    }

    console.time("Fetching course results");
    const userLearningPathsCoursesResults = await Promise.all(
      learningPathsCourses.map(async (course) => {
        if (!course || !course.Id) {
          console.warn("Invalid course data:", course);
          return undefined;
        }

        return await this.#getCourse(lmsUserId, course.Id).catch((error) => {
          console.error("Error fetching course description:", error.message);
          return undefined; // Handle the error and return undefined for this course
        });
      })
    );
    console.timeEnd("Fetching course results");

    return userLearningPathsCoursesResults.filter((result) => result !== undefined);
  } catch (error) {
    console.error("Error in getCourseResults:", error.message);
    throw error;
  }
}


  // Private methods

  // This function will update the list data to the user training data

    // This function will get all the modules in the learning path

    async #getModules(lmsUserId, coursesInLearningPath) {
      // console.log("coursesInLearningPath", coursesInLearningPath);
      const coursesModulesArray = await Promise.all(
        coursesInLearningPath.map(async(course) => {
          let userCourseData = await getUserCourseData(lmsUserId, course.Id);
          const courseDetails = await getCourseDetails(course.Id);
          
          userCourseData.Description = course.Description;
          userCourseData.CourseImageURL = courseDetails.CourseImageURL;
  
          return userCourseData;
        })
      );
      
      const filteredCoursesModulesArray = coursesModulesArray.filter(course => course !== undefined);
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

    async #updateDataStructure(userTrainingData, baseLineData) {
      for (const element of baseLineData) {
        let productTraining = userTrainingData[0].find(
          (e) => e.Id === element.litmosLearningPathId
        );
        let foundIn = 0; // 0 = Learning Paths
    
        if (!productTraining) {
          productTraining = userTrainingData[1].find(
            (e) => e.Id === element.litmosLearningPathId
          );
          foundIn = 1; // 1 = Courses
        }

        element.Id = element.litmosLearningPathId;
        element.PercentageComplete = productTraining?.PercentageComplete;
        element.litmosLearningPathUrl = `${productTraining?.CourseCreatedDate
          ? process.env.LMS_COURSE_PATH_URL
          : process.env.LMS_LEARNING_PATH_URL
          }${productTraining?.OriginalId}`;
    
        if (productTraining?.Id) {
          let details = null;
          try {
            if (foundIn === 0) {
              details = await getLearningPathDetails(productTraining.Id);
            } else {
              details = await getCourseDetails(productTraining.Id);
            }
          } catch (err) {
            console.warn(`Could not fetch details for ID ${productTraining.Id}`);
          }
    
          if (details) {
            element.CourseImageURL = foundIn === 0
              ? details?.LearningPathImageURL || null
              : details?.CourseImageURL || null;
          } else {
            element.CourseImageURL = null;
          }
        } else {
          element.CourseImageURL = null;
        }
      }
    
      return baseLineData;
    }
    


// This function will get the course details and the user course data 

  async #getCourse(lmsUserId, courseId) {
  
    const courseDetail = await getCourseDetails(courseId);
    let userCourseResults = await getUserCourseData(lmsUserId, courseId);
    if (!userCourseResults) {
      console.error(`User course data not found for course ID: ${courseId}`);
      return ;
    }
  
    userCourseResults.litmosLearningPathUrl = `${process.env.LMS_COURSE_PATH_URL}${userCourseResults.OriginalId}`;
    userCourseResults.Description = courseDetail?.Description || "No description available";
    userCourseResults.CourseImageURL = courseDetail?.CourseImageURL || "No image available";

    return userCourseResults;
  }
}

const lms = new Lms();

module.exports = lms;
