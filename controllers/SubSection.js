
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const {uploadToCloudinary} = require("../utils/UploaderCloudinary");
// require("dotenv").config();


exports.createSubSection = async (req,res) =>{
    try{
        const {title, timeDuration, description , sectionId} = req.body;

        const video = req.files.videoFile;

        if(!title || !timeDuration || !description || !video || !sectionId){
            return res.status(400).json({
                success: false,
                message:"Please fill all fields"
            });
        }

        const uploadDetails = await uploadToCloudinary(video, process.env.FOLDER_NAME);

        console.log(uploadDetails);

        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
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
        
        console.log(updatedSection);

        return res.status(200).json({
            success: true,
            message: "SubSection created successfully",
            data: updatedSection 
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
        const {title, timeDuration, description , subSectionId} = req.body;

        const video = req.files.videoFile;

        if(!title || !timeDuration || !description || !video || !subSectionId){
            return res.status(400).json({
                success: false,
                message:"Please fill all fields"
            }); 
        }

        const uploadDetails = await uploadToCloudinary(video, process.env.FOLDER_NAME);

        const subSectionDetails = await SubSection.findByIdAndUpdate(
             subSectionId,
            {
            title: title,
            timeDuration: timeDuration,
            description: description,
            video: uploadDetails.secure_url,
            },
            {new:true}
        );

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            data: subSectionDetails,
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
        const {subSectionId, sectionId} = req.body;

        if(!subSectionId || !sectionId){
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

        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully"
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