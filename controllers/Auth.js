
const User = require("../models/User");
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const Profile = require("../models/Profile");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const {passwordUpdated} = require("../mail/templates/passwordUpdate");
const agenda = require("../config/agenda");
const mongoose = require('mongoose');
require("dotenv").config();

// Sendotp
exports.sendOTP = async (req,res) =>{
    try {
        const {email} = req.body;

        const checkUserPresent = await User.findOne({email});

        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message: "User already present",
            });
        }

        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars: false,
        });

        // console.log(otp);

        let result = await OTP.findOne({otp:otp});

        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars: false,
            });

            result = await OTP.findOne({otp:otp});
        }

        const optPayload = {email, otp};

        const otpBody = await OTP.create(optPayload);
        // console.log(otpBody);

        res.status(200).json({
            success:true,
            message: "OTP Sent Successfully",
            otp,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

// signUp
exports.signUp = async (req,res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            contactNumber,
            accountType,
            otp,
        } = req.body;

        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message: "Please fill all fields",
            });
        };

        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message: "Password and ConfirmPassword does not match,Please try again",
            });
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message: "User already present",
            })
        }

        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        // console.log(recentOTP);

        if(recentOTP.length === 0){
            return res.status(400).json({
                success:false,
                message: "OTP does not exist",
            })
        }else if(otp !== recentOTP[0].otp){
            return res.status(400).json({
                success:false,
                message: "Invalid OTP",
            }) 
        }

        const hashedPassword = await bcrypt.hash(password,10);

        let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null, 
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            contactNumber,
            accountType : accountType,
            approved:approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`
        });

        res.status(200).json({
            success:true,
            message: "User Created Successfully",
            user,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered,Please try again",
            error:error.message,
        })
    }
};

// Login
exports.login = async (req,res) => {
    try {
        const {email, password} = req.body;

        if(!email ||!password){
            return res.status(403).json({
                success:false,
                message: "Please fill all fields",
            });
        }

        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message: "User is not registered,please signUp first",
            });
        }

        if (user.deletionJobId) {
            await agenda.cancel({ _id: new mongoose.Types.ObjectId(user.deletionJobId) });

            // Clear the job ID from the user record
            user.deletionJobId = null;
            await user.save();

            console.log(`Deletion job for user ${user._id} cancelled due to login.`);
        }

        
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"24h"
            });

            user.token = token;
            user.password = undefined;

            const options = {
                expirse: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            };

            res.cookie('token', token,options).status(200).json({
                success:true,
                message: "Login Successful",
                user,
                token,
            });
        }
        else{
            return res.status(400).json({
                success:false,
                message: "Password is incorrect",
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error.message,
            message:"Login failure, Please try again",
        })
    }
};

// changePassword
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword} = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		// if (newPassword !== confirmNewPassword) {
		// 	// If new password and confirm new password do not match, return a 400 (Bad Request) error
		// 	return res.status(400).json({
		// 		success: false,
		// 		message: "The password and confirm password does not match",
		// 	});
		// }

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};