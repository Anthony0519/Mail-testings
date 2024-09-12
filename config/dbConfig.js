const mongoose = require("mongoose")
require("dotenv").config()

const DB = process.env.DBLink

mongoose.connect(DB).then(()=>{
    console.log("DATABASE CONNECTED");
}).catch((err)=>{
    console.log(err.message);
})