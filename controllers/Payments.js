

const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");


exports.capturePayment = async (req,res) => {
    const {course_Id} = req.body;
    const userId = req.user.id;

    if(!course_Id){  
        return res.status(404).json({
            success: false,
            message: "Please provide valid course ID"
        })
    };
    let course;

    try {
        course = await Course.findById(course_Id);
        if(!course){
            return res.status(404).json({
                success: false,
                message: "Could not find the course"
            });
        }
         
        const uId = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uId)){
            return res.status(404).json({
                success: false,
                message: "Student is already enrolled"
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Could not find",
            error: error.message
        })
    }

    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount*100,
        currency,
        receipt: Math.random(Date.now()).toString,
        notes:{
            courseId: course_Id,
            userId,
        }        
    };

    try {
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not initiate order"
        })
    }
};

exports.verifySignature = async (req,res) =>{
    const webhookSecret = "12345678";

    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(digest === signature){
        console.log("Payment is Authorised");

        const {courseId, userId} = req.body.payload.payment.entity.notes; 

        try {
            
            const enrolledCourse = await Course.findByIdAndUpdate({_id: courseId},
                                                                    {
                                                                        $push:{
                                                                            studentsEnrolled:userId
                                                                        }
                                                                    },
                                                                    {new: true}
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success: false,
                    message: "Could not find the course"
                });
            }

            console.log(enrolledCourse);

            const enrolledStudent = await User.findByIdAndUpdate(
                                                            {_id:userId},
                                                            {
                                                                $push:{
                                                                    course:courseId
                                                                }
                                                            },
                                                            {new: true},

            );

            console.log(enrolledStudent);

            // const emailResponse = await mailSender(
            //                         enrolledCourse.email,
            //                         "Congratulations from CodeHelp",
            //                         "congratulation, you are onboarded into new CodeHelp course",
            // );

            const emailResponse = await mailSender(
                                    enrolledCourse.email,
                                    "Congratulations from CodeHelp",
                                    courseEnrollmentEmail(enrolledCourse.courseName, enrolledStudent.firstName)
            );

            console.log(emailResponse);

            return res.status(200).json({
                success: true,
                message: "Signature verifird and Course Added Successfully"
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }else{
        return res.status(400).json({
            success: false,
            message: "Invalid request"
        });
    }

};