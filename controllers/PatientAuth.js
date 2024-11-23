const Patient = require ('./../models/PatientAuth_Model')
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const responseMsgs = require ( './../utilities/responseMsgs')
const errorHandler = require ('./../utilities/errorHandler')

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
            data : addPatient
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

        let token = jwt.sign({},process.env.jwtKey)
        res.status(200).cookie('jwt',token).json({
            'status' : responseMsgs.SUCCESS,
            data : 'Loged In Successfully'
        })

    }
    catch(er){
        console.log(er)
        errorHandler(res,er)
    }
}

module.exports = {
    register,
    login
}