
const Category = require("../models/Categorys")

function getRandomInt(max) {
	return Math.floor(Math.random() * max)
  }

exports.createCategory = async (req,res) => {
    try {
        const {name,description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const categorysDetails = await Category.create({
            name:name,
            description:description,
        });

        console.log(categorysDetails);

        return res.status(200).json({
            success: true,
            message: "Category created successfully",
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.getAllCategorys = async (req,res) => {
    try {
        const allCategorys = await Category.find({},{name:true,description:true});

        return res.status(200).json({
            success: true,
            message: "All Categorys fetched successfully",
            data:allCategorys,
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.categoryPageDetails = async (req, res) => {
	try {
	  const { categoryId } = req.body

	  // Get courses for the specified category
	  const selectedCategory = await Category.findById(categoryId)
		.populate([{
		  path: "courses",
		  match: { status: "Published" },
		  populate:[
			{path:"instructor"},
			{path:"ratingAndReviews"}
		  ],		  
		},])
		.exec()
  
	//   console.log("SELECTED COURSE", selectedCategory)
	  // Handle the case when the category is not found
	  if (!selectedCategory) {
		// console.log("Category not found.")
		return res
		  .status(404)
		  .json({ success: false, message: "Category not found" })
	  }
	  // Handle the case when there are no courses
	  if (selectedCategory.courses.length === 0) {
		// console.log("No courses found for the selected category.")
		return res.status(404).json({
		  success: false,
		  message: "No courses found for the selected category.",
		})
	  }
  
	  // Get courses for other categories
	  const categoriesExceptSelected = await Category.find({
		_id: { $ne: categoryId },
	  })
	//   let differentCategory = await Category.findOne(
	// 	categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
	// 	  ._id
	//   )
	// 	.populate({
	// 	  path: "courses",
	// 	  populate:{
	// 		path:"instructor"
	// 	  },
	// 	  match: { status: "Published" },
	// 	})
	// 	.exec()

	let differentCategory = null;
    if (categoriesExceptSelected.length > 0) {
      const randomIndex = getRandomInt(categoriesExceptSelected.length);
      const randomCategoryId = categoriesExceptSelected[randomIndex]._id;

      differentCategory = await Category.findById(randomCategoryId)
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: { path: "instructor" },
        })
        .exec();
    }
		
	//   console.log()
	  // Get top-selling courses across all categories
	  const allCategories = await Category.find()
		.populate({
		  path: "courses",
		  match: { status: "Published" },
		  populate:{
			path:"instructor"
		  },
		})
		.exec()

	  const allCourses = allCategories.flatMap((category) => category.courses)
	  const mostSellingCourses = allCourses
		.sort((a, b) => b.sold - a.sold)
		.slice(0, 10)
  
	  res.status(200).json({
		success: true,
		data: {
		  selectedCategory,
		  differentCategory,
		  mostSellingCourses,
		},
	  })
	} catch (error) {
	  return res.status(500).json({
		success: false,
		message: "Internal server error",
		error: error.message,
	  })
	}
}