const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// resetPasswordToken
exports.resetPasswordToken = async (req,res) => {
    try {
        const email = req.body.email;

        const user = await User.findOne({email: email});
        if(!user){
            return res.status(404).json({
                success: false,
                message: `This Email: ${email} is not Registered With Us Enter a Valid Email `
            });
        }

        const token = crypto.randomBytes(20).toString("hex");

        const updatedDetails = await User.findOneAndUpdate(
                                        {email: email},
                                        { token: token,
                                            resetPasswordExpires: Date.now() + 5*60*1000,
                                        },
                                        {new:true})

        const url = `http://localhost:3000/update-password/${token}`;

        await mailSender(email,
                        "Password reset Link",
                        `Your Link for email verification is ${url}. Please click this url to reset your password.`);


        return res.status(200).json({
            success: true,
            message: "Password reset link email sent successfully,Please click email and change your password"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message:"Something went wrong while sending reset password mail"
        })
    }
}

// resetPassword

exports.resetPassword = async (req,res) => {
    try {
        const {token, password , confirmPassword} = req.body;

        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const userDetails = await User.findOne({token: token});

        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "Token is invalid"
            });
        }

        if(userDetails.resetPasswordExpires < Date.now()){
            return res.status(404).json({
                success: false,
                message: "Token has expired"
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);
        
         await User.findOneAndUpdate(
            {token:token},
            {password: hashedPassword},
            {new:true}
        );

        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            eroro: error.message,
            message:"Something went wrong while resetting password"
        })
    }
}