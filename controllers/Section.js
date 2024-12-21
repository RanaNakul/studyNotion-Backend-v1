

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
        const {newSectionName,sectionId, courseId} = req.body;

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

        const updatedCourseDetails = await Course.findById(courseId
                                                )
                                                .populate("category")
                                                .populate({
                                                    path:"courseContent",
                                                    populate:{
                                                        path:"subSection",
                                                    },
                                                })
                                                .exec();

        // console.log("updatedCourseDetails -> ",updatedCourseDetails);

        return res.status(200).json({
            success: true,
            message:"Section Updated Successfully",
            updatedCourseDetails,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to update section,Please try again",
            error:error.message
        })
    }
};

exports.deleteSection = async (req, res) => {
    try {
      const { sectionId, courseId } = req.body
      await Course.findByIdAndUpdate(courseId, {
        $pull: {
          courseContent: sectionId,
        },
      })
      const section = await Section.findById(sectionId)
      console.log(sectionId, courseId)
      if (!section) {
        return res.status(404).json({
          success: false,
          message: "Section not found",
        })
      }
      // Delete the associated subsections
      await SubSection.deleteMany({ _id: { $in: section.subSection } })
  
      await Section.findByIdAndDelete(sectionId)
  
      // find the updated course and return it
      const course = await Course.findById(courseId)
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      res.status(200).json({
        success: true,
        message: "Section deleted",
        data: course,
      })
    } catch (error) {
      console.error("Error deleting section:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }
  

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