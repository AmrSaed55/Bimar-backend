import QRcode from "qrcode"
import jwt from "jsonwebtoken"
import PatientModel from "../models/PatientAuth_Model.js"
import DoctorModel from "../models/doctorModel.js"
import { validationResult } from "express-validator"
import errorHandler from "../utilities/errorHandler.js"
import nodemailer from "nodemailer"
import crypto from "crypto"
import dotenv from 'dotenv';
dotenv.config();

const QRcodeGeneration = async(req,res)=>{
    try {
        const{patientEmail, doctorEmail, accessDuration} = req.body;
        let validationError = validationResult(req);
        if (!validationError.isEmpty()) {
          throw validationError;
        }

        const patient = await PatientModel.findOne({userEmail: patientEmail});
        const doctor = await DoctorModel.findOne({userEmail: doctorEmail});

        if(!patient || !doctor){
            throw "Patient or doctor not found";
        }

        const payload = {
            patientEmail,
            doctorEmail,
            exp: Math.floor(Date.now()/1000) + accessDuration*60
        };

        const token = jwt.sign(payload, process.env.JWT_KEY);
        const qrcodeData = await QRcode.toDataURL(token);

        res.json({
            qrcodeData,
            token,
            expiresIn : accessDuration*60
        });
    } catch (er) {
        console.log(er);
        errorHandler(res, er);
    }
};

const QRcodeVerification = async(req,res)=>{
    try {
        const {token , doctorEmail} = req.body;
        let validationError = validationResult(req);
        if (!validationError.isEmpty()) {
          throw validationError;
        }
        const decode = jwt.verify(token, process.env.JWT_KEY);
        if(decode.doctorEmail !== doctorEmail){
            throw "Access Denied";
        }
        const patient = await PatientModel.findOne({userEmail: decode.patientEmail});
        if(!patient){
            throw "Patient Not Found";
        }

        res.json({
            valid: true,
            information: {
                medicalRecord : patient.medicalRecord || "No medical records available",
                personalRecords : patient.personalRecords || "No personal records available"
            },
            data: "Access Granted"
        });
    } catch (er) {
        console.log(er);
        errorHandler(res, er);
    }
};


const accessRequests = new Map();


const generateAccessLink = async (req, res) => {
    try {
        const { patientEmail, doctorEmail, accessDuration } = req.body;

        let validationError = validationResult(req);
        if (!validationError.isEmpty()) {
            throw validationError;
        }

        const patient = await PatientModel.findOne({ userEmail: patientEmail });
        const doctor = await DoctorModel.findOne({ doctorEmail: doctorEmail });

        if (!patient || !doctor) {
            throw "Patient or doctor not found";
        }

        const accessPassword = crypto.randomBytes(4).toString("hex");

        const payload = {
            patientEmail,
            doctorEmail,
            exp: Math.floor(Date.now() / 1000) + accessDuration * 60,
        };

        const token = jwt.sign(payload, process.env.JWT_KEY);
        const accessLink = `${process.env.FRONTEND_URL}/access/${token}`;

        accessRequests.set(token, { accessPassword, expiresAt: Date.now() + accessDuration * 60 * 1000 });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: doctor.doctorEmail,
            subject: "Patient Medical Record Access Link",
            text: `You have requested access to patient ${patient.userName}'s medical records.\n\n🔗 Access Link: ${accessLink}\n\n🛑 Ask the patient for the access password.`,
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: patient.userEmail,
            subject: "Doctor Access Password",
            text: `Your doctor (${doctor.doctorName}) has requested access to your medical records.\n\n🔑 Access Password: ${accessPassword}`,
        });

        res.status(200).json({
            accessLink,
            token,
            expiresIn: accessDuration * 60, 
            data: "Access link sent to doctor and password sent to patient",
        });
    } catch (er) {
        console.log(er);
        errorHandler(res, er);
    }
};

const verifyAccessLink = async (req, res) => {
    try {
        const { token, doctorEmail, password } = req.body;

        let validationError = validationResult(req);
        if (!validationError.isEmpty()) {
            throw validationError;
        }

    
        const decoded = jwt.verify(token, process.env.JWT_KEY);

     
        if (decoded.doctorEmail !== doctorEmail) {
            throw "Access Denied";
        }
        const patient = await PatientModel.findOne({ userEmail: decoded.patientEmail });
        if (!patient) {
            throw "Patient Not Found";
        }
        const storedAccess = accessRequests.get(token);
        if (!storedAccess || Date.now() > storedAccess.expiresAt) {
            accessRequests.delete(token);
            throw "Access Link Expired";
        }
        if (password !== storedAccess.accessPassword) {
            throw "Incorrect Password";
        }

        res.status(200).json({
            valid: true,
            information: {
                medicalRecord: patient.medicalRecord || "No medical records available",
                personalRecords: patient.personalRecords || "No personal records available",
            },
            data: "Access Granted",
        });

        accessRequests.delete(token);
    } catch (er) {
        console.log(er);
        errorHandler(res, er);
    }
}

export {
    QRcodeGeneration,
    QRcodeVerification,
    generateAccessLink,
    verifyAccessLink
}