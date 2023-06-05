const mongoose = require("mongoose")

var nameSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    email: {
        type: String,
        unique: true,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});
var User = mongoose.model("user", nameSchema);
module.exports = User;