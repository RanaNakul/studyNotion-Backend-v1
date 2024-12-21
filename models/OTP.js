

const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:5*60,
    },
});

async function sendVerificationEmail(email,otp){
    try {
        const mailResponse = await mailSender(email,"Verification Email Form StudyNotion", emailTemplate(otp));
        // console.log("Email sent successfully:", mailResponse.response);                                          
    } catch (error) {
        console.log("Error occurred while sending mails: ", error);
        throw error;
    }
}

otpSchema.pre("save", async function(next){

    // console.log("New Document saved to database");
    if(this.isNew){
        await sendVerificationEmail(this.email,this.otp);
    }
    next();
})


module.exports = mongoose.model('OTP',otpSchema);