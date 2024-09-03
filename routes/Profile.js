

const express = require('express');
const router = express.Router();

const {
    updateProfile,
    deleteAccount,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses,
} = require("../controllers/Profile");

const {auth, isStudent} = require("../middlewares/auth");

router.put("/updateProfile",auth, updateProfile);
router.delete("/deleteProfile",auth, isStudent, deleteAccount);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

router.get("/getUserDetails", auth, getAllUserDetails);

// Testing is pending of this router
router.get("/getEnrolledCourses", auth, getEnrolledCourses);

module.exports = router;