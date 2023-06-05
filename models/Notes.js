const mongoose = require("mongoose")

var nameSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
    },
    title: {
        type: String,
        required:true
    },
    description: {
        type: String,
        required:true
    },
    tag: {
        type: String,
        required:true
    },
    date:{
        type: Date,
        default:Date.now
       
    }
});
var Notes = mongoose.model("notes", nameSchema);
module.exports = Notes;