

const express = require('express');
const router = express.Router();

const {
    sendOTP,
    signUp,
    login,
    changePassword, 
} = require("../controllers/Auth");

const {
    resetPasswordToken,
    resetPassword,
} = require("../controllers/ResetPassword");

const {auth} = require("../middlewares/auth");

router.post("/signup", signUp);

router.post("/login", login);

router.post("/sendotp", sendOTP);

router.post("/changePassword", auth, changePassword);

router.post("/reset-password", resetPassword);

router.post("/reset-password-token", resetPasswordToken);


module.exports = router;