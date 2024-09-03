

const Course = require("../models/Course");
const Category = require("../models/Categorys");
const User = require("../models/User");
const {uploadToCloudinary} = require("../utils/UploaderCloudinary");

// createCourse
exports.createCourse = async (req,res) =>{
    try {
        let {courseName, courseDescription, whatYouWillLearn, price, category,
                tag,status,instructions} = req.body;

        const thumbnail = req.files.thumbnailImage;


        if(!courseDescription || !courseName || !whatYouWillLearn || !price || !category || !thumbnail || !tag){
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields"
            });
        } 

        if(!status || status === undefined){
            status = "Draft";
        };

        const userId = req.user.id;
        const instructorDetails = await User.findById(userId, {
            accountType: "Instrutor",
        });
        // console.log("instructorDetails-> ", instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: "Instructor Details not found"
            });
        }

        const categoryDetails = await Category.findById(category);

        if(!categoryDetails){
            return res.status(404).json({
                success: false,
                message: "Category Details not found"
            });
        }

        console.log("category -> ",category)
        console.log("categoryDetails._id -> ",categoryDetails._id)

        const thumbnailImage = await uploadToCloudinary(thumbnail, process.env.FOLDER_NAME);


        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn, 
            price,
            tags: tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions : instructions,
        });

        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id
                }
            },
            {new:true}
        );

        await Category.findByIdAndUpdate(
            {_id: categoryDetails._id},
            {
                $push: {
                    courses: newCourse._id
                }
            },
            {new:true},
        );

        return res.status(200).json({
            success: true,
            message: "Course Created Successfully",
            data: newCourse
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Failed to Create Course"
        })
    }
}

// getAllCourses
exports.getAllCourses = async (req,res) =>{
    try {
        const allCourses = await Course.find(
            {},
            {
                courseName:true,
                price:true,
                thumbnail:true,
                instructor:true,
                ratingAndReviews:true,
                studentEnrolled:true
            }).populate("instructor").exec();

        return res.status(200).json({
            success: true,
            message: "All Courses fetched successfully",
            data: allCourses
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Cannot Fetch course data"
        })
    }
}

// getCourseDetails 
exports.getCourseDetails = async (req,res) => {
    try{
        const {courseId} = req.body

        const courseDetails = await Course.find(
                                    {_id:courseId}
                                    ).populate(
                                        {
                                            path:"instructor",
                                            populate:{
                                                path:"additionalDetails",
                                            },
                                        }
                                    )
                                    .populate("category")
                                    .populate("ratingAndReviews")
                                    .populate({
                                        path:"courseContent",
                                        populate:{
                                            path:"subSection",
                                        },
                                    })
                                    .populate("studentsEnrolled")
                                    .exec();

        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: "Cannot find course details",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: courseDetails
        })
    }catch (error) {
        return res.status(500).json({
            success: false,
            message: "Cannot fetch course details",
            error: error.message,
        })
    }
}