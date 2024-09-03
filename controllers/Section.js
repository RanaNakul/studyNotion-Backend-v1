

const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const Course = require("../models/Course");

exports.createSection = async (req,res) => {
    try {
        const {sectionName, courseId} = req.body;

        if(!sectionName || !courseId ) {
            return res.status(400).json({
                success: false,
                message: "Missing properties"
            });
        }

        const newSection = await Section.create({ sectionName });

        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId, 
                                                {
                                                    $push:{ courseContent : newSection._id }
                                                },
                                                {new:true})
                                                .populate({
                                                        path:'courseContent',
                                                        populate:{
                                                            path:'subSection'
                                                        }
                                                })
                                                .exec();

        return res.status(200).json({
            success: true,
            message:"Section Created Successfully",
            updatedCourseDetails
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to create section,Please try again",
            error:error.message
        })
    }
};

exports.updateSection = async (req,res) => {
    try {
        const {newSectionName,sectionId} = req.body;

        if(!newSectionName || !sectionId ) {
            return res.status(400).json({
                success: false,
                message: "Missing properties"
            });
        }

        await Section.findByIdAndUpdate(sectionId,
                    {
                        sectionName: newSectionName
                    },
                    {new:true}
        );

        return res.status(200).json({
            success: true,
            message:"Section Updated Successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to update section,Please try again",
            error:error.message
        })
    }
};

exports.deleteSection = async (req,res) => {
    try{
        // const {sectionId} = req.params;
        const {sectionId , courseId} = req.body;

        if(!sectionId || !courseId){
            return res.status(400).json({
                success: false,
                message: "Missing properties"
            });
        }

        const sectionDetails = await Section.findById(sectionId);

        console.log(sectionDetails);

        if(sectionDetails.subSection.length > 0){
            return res.status(400).json({
                success: false,
                message: "First Delete SubSection of this section"
            })
        }

        await Section.findByIdAndDelete(sectionId);

        await Course.findByIdAndUpdate(courseId,
                                {
                                    $pull:{
                                        courseContent:sectionId
                                    }
                                },
                                {new:true}
                                );

        return res.status(200).json({
            success: true,
            message:"Section Deleted Successfully"
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Unable to delete section,Please try again",
            error:error.message
        })
    }
};

exports.getSectionDetails = async (req,res) => {
    try {

        const {sectionId} = req.body;

        const sectionDetails = await Section.find({_id:sectionId}).populate("subSection").exec();

        if(!sectionDetails){
            return res.status(404).json({
                success: false,
                message: "Cannot find SectionDetails details",
            });
        }

        return res.status(200).json({
            success: true,
            message: "SectionDetails details fetched successfully",
            data: sectionDetails
        })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Cannot find SubSection details",
            error:error.message
        })
    }
};