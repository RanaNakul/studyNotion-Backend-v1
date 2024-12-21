
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const {uploadToCloudinary} = require("../utils/UploaderCloudinary");
const Course = require("../models/Course");
// require("dotenv").config();


exports.createSubSection = async (req,res) =>{
    try{
        const {title,  description, sectionId, courseId} = req.body;

        const video = req.files.videoFile;

        if(!title || !description || !video || !sectionId || !courseId){
            return res.status(400).json({
                success: false,
                message:"Please fill all fields"
            });
        }

        const uploadDetails = await uploadToCloudinary(video, process.env.FOLDER_NAME);

        // console.log(uploadDetails);

        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: uploadDetails.duration,
            description: description,
            videoUrl: uploadDetails.secure_url,
        });

        console.log(subSectionDetails);

        const updatedSection = await Section.findByIdAndUpdate(sectionId,
                                                                {
                                                                    $push:{subSection: subSectionDetails._id}
                                                                },
                                                                {new:true})
                                                                .populate('subSection')
                                                                .exec();
        

        const data = await Course.findById(courseId
                                            )
                                            .populate("category")
                                            .populate({
                                                path:"courseContent",
                                                populate:{
                                                    path:"subSection",
                                                },
                                            })
                                            .exec();

        return res.status(200).json({
            success: true,
            message: "SubSection created successfully",
            data, 
        });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Error while creating SubSection",
            error: error.message
        })
    }
}

exports.updateSubSection = async (req,res) => {
    try{
        const {title, description , subSectionId, courseId} = req.body;

        const subSection = await SubSection.findById(subSectionId);

        if(!subSection){
            return res.status(404).json({
                success: false,
                message: "SubSection Not Found"
            })
        }

        if(title !== undefined){
            subSection.title= title;
        }

        if(description !== undefined){
            subSection.description = description;
        }

        if(req.files && req.files.videoFile !== undefined){
            const video = req.files.videoFile;
            const uploadDetails = await uploadToCloudinary(video, process.env.FOLDER_NAME);
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = uploadDetails.duration;
        }

        await subSection.save();

        const data = await Course.findById(courseId
                                        )
                                        .populate("category")
                                        .populate({
                                            path:"courseContent",
                                            populate:{
                                                path:"subSection",
                                            },
                                        })
                                        .exec();

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            data,
        })

    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Error while updating SubSection",
            error: error.message
        })
    }
};

exports.deleteSubSection = async (req,res) => {
    try {
        const {subSectionId, sectionId, courseId} = req.body;

        if(!subSectionId || !sectionId || !courseId){
            return res.status(400).json({
                success: false,
                message:"Missing parameties"
            })
        };

        await SubSection.findByIdAndDelete(subSectionId);

        await Section.findByIdAndUpdate(sectionId,
                                        {
                                            $pull: {
                                                subSection:subSectionId
                                            }
                                        },
                                        {new:true}
                                        )

        const data = await Course.findById(courseId
                                                )
                                                .populate("category")
                                                .populate({
                                                    path:"courseContent",
                                                    populate:{
                                                        path:"subSection",
                                                    },
                                                })
                                                .exec();

        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully",
            data,
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while deleting SubSection",
            error: error.message
        })
    }
}

exports.getSubSectionDetails = async (req,res) => {
    try {

        const {subSectionId} = req.body;

        const subSectionDetails = await SubSection.find({_id:subSectionId});

        if(!subSectionDetails){
            return res.status(404).json({
                success: false,
                message: "Cannot find SubSectionDetails details",
            });
        }

        return res.status(200).json({
            success: true,
            message: "SubSectionDetails details fetched successfully",
            data: subSectionDetails
        })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Cannot find SubSection details",
            error:error.message
        })
    }
}