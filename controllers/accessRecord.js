import QRcode from "qrcode"
import jwt from "jsonwebtoken"
import PatientModel from "../models/PatientAuth_Model.js"
import DoctorModel from "../models/doctorModel.js"
import { validationResult } from "express-validator"
import errorHandler from "../utilities/errorHandler.js";
import dotenv from 'dotenv';
dotenv.config();

const QRcodeGeneration = async(req,res)=>{

    try {
        const{patientName,doctorName,accessDuration} = req.body
        let validationError = validationResult(req);
        if (!validationError.isEmpty()) {
          throw validationError;
        }

        const patient = await PatientModel.findOne({userName:patientName})
        const doctor = await DoctorModel.findOne({doctorName:doctorName})

        if(!patient || !doctor){
            throw "patient or doctor not found"
        }

        const payload = {
            patientName,
            doctorName,
            exp: Math.floor(Date.now()/1000) + accessDuration*60
        }

        const token = jwt.sign(payload, process.env.JWT_KEY)
        const qrcodeData = await QRcode.toDataURL(token)

        res.json({
            qrcodeData,
            token,
            expiresIn : accessDuration*60
        })
    } catch (er) {
        console.log(er);
        errorHandler(res, er);
    }
}

const QRcodeVerfication = async(req,res)=>{
    try {
        const {token , doctorName} = req.body
        let validationError = validationResult(req);
        if (!validationError.isEmpty()) {
          throw validationError;
        }
        const decode = jwt.verify(token,process.env.JWT_KEY)
        if(decode.doctorName != doctorName){
            throw "Access Denied"
        }
        const patient = await PatientModel.findOne({userName:decode.patientName})
        if(!patient){
            throw "Patient Not Found"
        }

        res.json({
            valid:true,
            information:{
                medicalRecord : patient.medicalRecord || "No medical records available",
                personalRecords : patient.personalRecords || "No personal records available"
            },
            data:"Access Granted"
        })
    } catch (er) {
        console.log(er);
        errorHandler(res, er);
    }
}

export {
    QRcodeGeneration,
    QRcodeVerfication
}