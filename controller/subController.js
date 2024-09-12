const subModel = require("../model/subModel")
// const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {sendEmail} = require("../Utils/sendMail")
// const mailgen = require("mailgen")
// const DynamicEmail = require("../Utils/emailtemplate")

// create a new user
exports.subscribe = async (req,res)=>{
    try{

        // get the user's input
        const {email} = req.body

        // check if tne user entered all fields
        if(!email){
            return res.status(400).json({
                error:"All fields must be filled"
            })
        }
        
        // check if the email already exist
        // const checkEmail = await subModel.findOne({email:email})
        // if(checkEmail){
        //     return res.status(400).json({
        //         error:"user with email already exist"
        //     })
        // }
        // create the user
        const user = await subModel.create({
            email:email.toLowerCase()
        })

        // generate a token for the user
        const token = jwt.sign({email},process.env.jwt_secret,{expiresIn:"5mins"})

        // verify the users email
        const link = `${req.protocol}://${req.get("host")}/api/comfirm/${token}`
        // const html = DynamicEmail(link,user.firstName,user.lastName.slice(0,1).toUpperCase())
        
        sendEmail({
            email:user.email,
            subject: "COMFIRM SUBSCRIPTION",
            html:`<p>Thank you for subscribing to our newsletter,</p>
                  <p>please comfirm your subscription by clicking the link below</p>
                  <a href="${link}">Comfirm Subscription</a>`,
        })

        // success message
        res.status(201).json({
            message:"subscription successfully... Kindly check your email or spam for verification",
            user
        })

    }catch(err){
        res.status(500).json({
            error:err.message
        })
    }
}

exports.comfirmsubscription = async (req,res)=>{
    try{

        // get the user token
        const {token} = req.params
        if (!token) {
            return res.status(400).json({
                error:"Access denied... Authorization not fouund"
            })
        }

        // extract the user's id from the token
        const decodeToken = jwt.verify(token,process.env.jwt_secret)

        // extract the user's id
        const email = decodeToken.email

        // find the user that own the token
        const user = await subModel.findOne({email})
        if(!user){
            return res.status(400).json({
                error:"email not found"
            })
        }

        // check if the user is already verified
        if(user.comfirm === true){
            return res.redirect("https://furniro-iota-eight.vercel.app/#/newsletter-success")
        }
       
        // find by id and verify
        await subModel.updateOne({email},{$set: {comfirm:true}})

        res.redirect("https://furniro-iota-eight.vercel.app/#/newsletter-success")
        
        
        // res.status(200).json({
        //     message: "you have been verified",
        // })
       

    }catch(err){
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({
                error:"link expired"
            })
        }
        res.status(500).json({
            error:err.message
        })
    }
}
