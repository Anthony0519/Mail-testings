const mongoose = require("mongoose")

const subSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    comfirm:{
        type:Boolean,
        default:false
    },
},{timestamps:true})

const subModel = mongoose.model("subscription",subSchema)

module.exports = subModel