const express = require("express")
require("./config/dbConfig")
const userRouter = require("./router/userRouter")

const PORT = process.env.port

const app = express()
app.use(express.json())

app.use("/api",userRouter)

app.listen(PORT,()=>{
    console.log(`SERVER ON PORT: ${PORT}`);
})
