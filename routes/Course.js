

const express = require("express");
const router = express.Router();


const {
    createCourse,
    getAllCourses,
    getCourseDetails,
    getFullCourseDetails,
    editCourse,
    getInstructorCourses,
    deleteCourse,
} = require("../controllers/Course");

const {
    createCategory,
    getAllCategorys,
    categoryPageDetails,
} = require("../controllers/Categorys");

const {
    createSection,
    updateSection,
    deleteSection,
    getSectionDetails,
} = require("../controllers/Section");

const {
    createSubSection,
    updateSubSection,
    deleteSubSection,
    getSubSectionDetails,
} = require("../controllers/SubSection");

const {
    createRating,
    getAverageRating,
    getAllRating,
} = require("../controllers/RatingAndReview");

const {
    updateCourseProgress,
    getProgressPercentage,
} = require("../controllers/CourseProgress")

const {auth, isAdmin, isStudent, isInstructor} = require("../middlewares/auth");

// Course
router.post("/createCourse",auth, isInstructor, createCourse);
router.get("/getAllCourses", getAllCourses);
router.post("/getCourseDetails", getCourseDetails);
router.post("/editCourse", auth, isInstructor, editCourse);
router.post("/getFullCourseDetails", auth, getFullCourseDetails);
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
router.delete("/deleteCourse",auth, isInstructor, deleteCourse);


// Course Progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);
router.post("/getProgressPercentage", auth, isStudent, getProgressPercentage)


// Section
router.post("/addSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.post("/deleteSection", auth, isInstructor, deleteSection);
router.post("/getSectionDetails", auth, isInstructor, getSectionDetails);


// SubSection
router.post("/addSubSection", auth, isInstructor, createSubSection);
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);
router.post("/getSubSectionDetails", auth, isInstructor, getSubSectionDetails);

// Category
router.post("/createCategory",auth, isAdmin, createCategory);
router.get("/showAllCategories", getAllCategorys);
router.post("/getCategoryPageDetails",categoryPageDetails);


// Rating
router.post("/createRating", auth, isStudent, createRating);
router.post("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating)


module.exports = router;