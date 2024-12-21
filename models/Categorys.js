
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true,
    },
    description: {
        type: String,
    },
    courses: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
}
);

// ,
// {
//     collection: "Category"
// }

module.exports = mongoose.model('Category',categorySchema);