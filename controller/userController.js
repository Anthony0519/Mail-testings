const userModel = require("../model/userModel")
// const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {sendEmail} = require("../Utils/sendMail")
const mailgen = require("mailgen")
const DynamicEmail = require("../Utils/emailtemplate")

// create a new user
exports.createUser = async (req,res)=>{
    try{

        // get the user's input
        const {firstName,lastName,email} = req.body

        // check if tne user entered all fields
        if(!firstName || !lastName || !email){
            return res.status(400).json({
                error:"All fields must be filled"
            })
        }
        
        // check if the email already exist
        // const checkEmail = await userModel.findOne({email:email})
        // if(checkEmail){
        //     return res.status(400).json({
        //         error:"user with email already exist"
        //     })
        // }
        // check if the password matches
        // if(confirmPassword !== password){
        //     return res.status(400).json({
        //         error:"password does not match"
        //     })
        // }

        // hash the password
        // const saltPass = bcrypt.genSaltSync(12)
        // const hash = bcrypt.hashSync(password,saltPass)

        // create the user
        const user = await userModel.create({
            firstName:firstName.toLowerCase().charAt(0).toUpperCase() + firstName.slice(1),
            lastName:lastName.toLowerCase().charAt(0).toUpperCase() + lastName.slice(1),
            email:email.toLowerCase()
        })

        // generate a token for the user
        const token = jwt.sign({
            userId:user._id,
            email:user.email,
        },process.env.jwt_secret,{expiresIn:"5mins"})

        // verify the users email
        const link = `${req.protocol}://${req.get("host")}/api/v1/users/verify/${token}`
        const html = DynamicEmail(link,user.firstName,user.lastName.slice(0,1).toUpperCase())

        // const mailGenerator = new mailgen({
        //     theme: "default",
        //     product: {
        //         name: "Tour Haven",
        //         link: "https://tour-haven-appli.vercel.app",
        //         logo: "https://res.cloudinary.com/dfqlpxmqi/image/upload/v1708326514/tourHaven_xqwjy0.jpg",
        //         copyright: '© 2016 Tour Haven. All rights reserved.',
        //     }
        // })
        
        // const emailContent = {
        //     body:{
        //         name:`${user.firstName} ${user.lastName.slice(0,1)}`,
        //         intro: `🌟 Welcome, ${user.firstName} ${user.lastName} 🌟,<br/>We're excited to have you join us. Please verify this mail to get started.`,
        //         action:{
        //             instructions: "please verify your email by clicking the button below",
        //             button:{
        //                 color: "#05446E",
        //                 text:"Verify",
        //                 link:link,
        //             },
        //         },
        //         outro:"The link expires in 5mins"
        //     }
        // }
        
        // const emailBody = mailGenerator.generate(emailContent)
        // // const emailText = mailGenerator.generatePlaintext(emailContent)

        sendEmail({
            email:user.email,
            subject: "KIND VERIFY YOUR ACCOUNT",
            html:html,
            // html:emailBody,
            // text:emailText
        })

        // success message
        res.status(201).json({
            message:"Account created successfully... Kindly check your email or spam for verification",
            user
        })

    }catch(err){
        res.status(500).json({
            error:err.message
        })
    }
}

exports.verifyUser = async (req,res)=>{
    try{

        // get the user token
        const {token} = req.params
        if (!token) {
            return res.status(400).json({
                error:"link expired"
            })
        }

        // extract the user's id from the token
        const decodeToken = jwt.verify(token,process.env.jwt_secret)

        // extract the user's id
        const ID = decodeToken.userId

        // find the user that own the token
        const user = await userModel.findById(ID)
        if(!user){
            return res.status(400).json({
                error:"email not found"
            })
        }

        // check if the user is already verified
        if(user.isverified === true){
            return res.status(400).json({
                error:"user already verified"
            })
        }
        
        // find by id and verify
         await userModel.findByIdAndUpdate(ID,{isVerified:true}, {new:true})
    
        // res.status(200).json({
        //     message: "you have been verified",
        // })
        res.redirect("https://tour-haven-appli.vercel.app/verify")

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
