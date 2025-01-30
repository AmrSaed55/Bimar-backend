import responseMsgs from '../utilities/responseMsgs.js';
import errorHandler from '../utilities/errorHandler.js';
import jwt from 'jsonwebtoken';
import PatientModel from '../models/PatientAuth_Model.js';

const getPatientRecords = async (req,res)=>{
    try{
        const token = req.cookies.jwt;
        if(!token){
            throw 'No Token Provided';
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
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

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userEmail = decoded.email;

        const patient = await PatientModel.findOne({ userEmail }).select("personalRecords")
        if (!patient) {
            throw "Patient not found";
        }

        patient.personalRecords = {...patient.personalRecords, ...PersonalRecordsData};
        await patient.save();
        
        res.status(200).json({
            status: responseMsgs.SUCCESS,
            data: patient.personalRecords,
        });
    }catch(err){
        console.log(err);
        errorHandler(err);
    }
}

export default {
    getPatientRecords,
    updatePersonalRecords
};