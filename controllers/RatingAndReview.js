
const RatingAndReview = require("../models/RatingAndReview");
const { default: mongoose } = require("mongoose");
const Course = require("../models/Course");

exports.createRating = async (req,res) => {
    try{
        const {rating,review,courseId} = req.body;
        const userId = req.user.id;

        const courseDetails = await Course.findOne(
                                    {_id: courseId,
                                        studentsEnrolled: {$elemMatch: {$eq: userId}}
                                    });
       
        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message:"Student is not enrolled in this course"
            })
        };

        const alreadyReviewed = await RatingAndReview.findOne({
                                        user: userId,
                                        course: courseId,
                                });

        if(alreadyReviewed){
            return res.status(404).json({
                success: false,
                message:"Student is already reviewed this course",
            })
        };

        const ratingReview = await RatingAndReview.create({
                                                    rating,
                                                    review,
                                                    course:courseId,
                                                    user:userId
        });

        await Course.findByIdAndUpdate({_id:courseId}, 
                        {
                            $push:{
                                ratingAndReviews: ratingReview._id
                            }
                        },
                        {new:true}
        )

        return res.status(200).json({
                success: true,
                message:"Rating and review created successfully",
                data: ratingReview
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message:"Rating and review could not be created",
            error: error.message
        })
    }
}

exports.getAverageRating = async (req, res) => {
    try{
        const courseId = req.body.courseId;

        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    courseId : new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg: "$rating"},
                },
            },
        ])

        if(result.length > 0){
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })
        }

        return res.status(200).json({
            success: true,
            message:"Average rating is 0, no rating given till now",
            averageRating: 0,
        })
        

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message:"Error while Fetching average rating",
            error: error.message
        })
    }
}

exports.getAllRating = async (req, res) => {
    try {
        const allReview = await RatingAndReview.find({})
                                .sort({rating: "desc"})
                                .populate({
                                    path:"user",
                                    select:"firstName lastName email image",
                                })
                                .populate({
                                    path:"course",
                                    select:"courseName",
                                })
                                .exec();
        return res.status(200).json({
            success: true,
            message: "All Review Fetched successfully",
            data: allReview,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error while fetch all Review",
            error: error.message
        })
    }
}