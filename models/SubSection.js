const mongoose = require('mongoose');

const SubSectionSchema = new mongoose.Schema({
 
    title:{
        type: String,
        required: true
    },
    timeDuration:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    videoUrl:{
        type: String,
    }

});


module.exports = mongoose.model('SubSection', SubSectionSchema);