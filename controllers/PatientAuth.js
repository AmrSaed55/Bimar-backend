const Patient = require ('./../models/PatientAuth_Model')
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const responseMsgs = require ('./../utilities/responseMsgs')
const errorHandler = require ('./../utilities/errorHandler')
const nodemailer = require('nodemailer')

const register = async (req,res) =>{

    try{

        let newPatientData = req.body
        let validationError = validationResult(req)
        if(!validationError.isEmpty()){
            throw(validationError)
        }

        let hashedPassword = await bcrypt.hash(newPatientData.userPassword,6)
        let addPatient = await Patient.create({...newPatientData,userPassword : hashedPassword})
        res.status(201).json({
            'status' : responseMsgs.SUCCESS,
             data : 'SignUp Successfully',
        })
    }
    catch(er){
        console.log(er)
        errorHandler(res.er)
    }
}

const login = async(req,res) =>{
    try{

        let credetials = req.body
        let getPatient = await Patient.findOne({userEmail : credetials.userEmail})
        if(!getPatient){
            throw('User Not Found')
        }

        let checkPassword = await bcrypt.compare(credetials.userPassword , getPatient.userPassword)
        if(!checkPassword){
            throw('Wrong Password')
        }

        const patientData = {
            userEmail : getPatient.userEmail , 
            userName : getPatient.userName , 
            userWeight : getPatient.userWeight , 
            userHeight : getPatient.userHeight ,
            userPhone : getPatient.userPhone, 
            DateofBirth : getPatient.DateofBirth,
            Gender : getPatient.Gender}

        let token = jwt.sign({},process.env.jwtKey)
        res.status(200).cookie('jwt',token).json({
            'status' : responseMsgs.SUCCESS,
            data : 'Loged In Successfully',
            patient : patientData
        })

    }
    catch(er){
        console.log(er)
        errorHandler(res,er)
    }
}


const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);  
}


const forgetpassword = async(req,res)=>{
    try{
        const {userEmail} = req.body
        const patient = await Patient.findOne({userEmail})
        if(!patient){
            throw 'User With This Email does not exist'
        }

        const otp = generateOtp()


        const token = jwt.sign(
            { email: userEmail }, 
            process.env.jwtKey,       
            { expiresIn: '10m' }      
        )

        
        const transporter = nodemailer.createTransport({
            service : 'gmail',
            port : process.env.email_port,
            auth:{
                user: process.env.user,
                pass: process.env.pass
            }
        })

        const mailOptions = {
            from : 'Bimar@gmail.com',
            to : userEmail,
            subject: 'Password Reset OTP',
            html: `<p>Your OTP is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`

        }

        transporter.sendMail(mailOptions,(err)=>{
            if (err) {
                console.log('Error:', err);
            } else {
                console.log('Email sent:', info.response);
            }
        })

        res.cookie('otp', otp, {
            httpOnly: true,      
            maxAge: 10 * 60 * 1000  
        });

        res.status(200).cookie('jwt',token).json({ 
            status: responseMsgs.SUCCESS, 
            data: 'OTP sent to your email',
         });
    }

    catch (err) {
        console.log(err);
        errorHandler(err)
    }
}

const verifyotp = async(req,res)=>{
    try{
        const {otp} = req.body
        const storedOtp = req.cookies.otp

        if(!storedOtp){
            throw ' OTP has expired or does not exist '
        }

        if(storedOtp !== otp){
            return res.status(400).json({
                status: responseMsgs.FAILURE,
                data: 'Incorrect OTP. Please try again.'
            })
        }
            

        res.status(200).json({
            status: responseMsgs.SUCCESS,
            data: 'OTP verified successfully. Now you can reset your password',
        })
    } catch(err){
        console.log(err)
        errorHandler(err)
    }
}

const resetPassword = async (req,res) =>{

    try{
        const {newPassword } = req.body
        const token = req.cookies.jwt

        if(!token){
            throw 'No Token Provided'
        }

        const decoded = jwt.verify(token, process.env.jwtKey);
        const email = decoded.email

        
        const patient = await Patient.findOne({ userEmail: email })
        if(!patient){
            throw 'User Not Found'
        }

        const hashedPassword = await bcrypt.hash(newPassword,6)

        const update = await Patient.updateOne({userEmail : email},{userPassword : hashedPassword})


        res.clearCookie('otp')

        res.status(200).json(update ? data = "Password updated" : data = 'password updated failed')
    } catch (err) {
        console.log(err);
        errorHandler(err)
    }
}



module.exports = {
    register,
    login,
    forgetpassword,
    resetPassword,
    verifyotp
}