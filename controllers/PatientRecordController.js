const responseMsgs = require('../utilities/responseMsgs');
const errorHandler = require('../utilities/errorHandler');
const jwt = require('jsonwebtoken');
const PatientModel = require('../models/PatientAuth_Model');

const getPatientRecords = async (req,res)=>{
    try{
        const token = req.cookies.jwt;
        if(!token){
            throw 'No Token Provided';
        }

        const decoded = jwt.verify(token, process.env.jwtKey);
        const userEmail = decoded.email;

        const patient = await PatientModel.findOne({userEmail}).select('personalRecords');
        if(!patient){
            throw "Patient not found";
        }

        res.status(200).json({
            status: responseMsgs.SUCCESS,
            data: patient.personalRecords,
        });
    }catch(err){
        console.log(err);
        errorHandler(err);
    }
}

const updatePersonalRecords = async(req,res)=>{
    try{
        const PersonalRecordsData = req.body;

        const token = req.cookies.jwt;
        if(!token){
            throw 'No Token Provided';
        }

        const decoded = jwt.verify(token, process.env.jwtKey);
        const userEmail = decoded.email;

        const patient = await PatientModel.findOne({ userEmail }).select("personalRecords");
        if (!patient) {
            throw "Patient not found";
        }

        patient.personalRecords = {...patient.personalRecords, ...PersonalRecordsData};

        res.status(200).json({
            status: responseMsgs.SUCCESS,
            data: patient.personalRecords,
        });
    }catch(err){
        console.log(err);
        errorHandler(err);
    }
}

module.exports = {
    getPatientRecords,
    updatePersonalRecords
}