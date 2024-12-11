const PatientModel = require("../models/PatientAuth_Model");
const responseMsgs = require('./../utilities/responseMsgs');
const errorHandler = require('./../utilities/errorHandler');
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const creatDiagnosis = async(req,res) => {
    try{

    let newDiagnosis = req.body
    const isFollowup = req.query.followup === 'true'
        let xrayImgs = req.files['Xray'];
        let labtestImgs = req.files['labResults'];

        // Handle file paths
        let xrayImgPaths = xrayImgs ? xrayImgs.map(file => file.path) : [];
        let labtestImgPaths = labtestImgs ? labtestImgs.map(file => file.path) : []

        console.log(labtestImgPaths)
        console.log(xrayImgPaths)


        newDiagnosis.xrayImgs = xrayImgPaths
        newDiagnosis.labtestImgs = labtestImgPaths
    let validationError = validationResult(req)
    if(!validationError.isEmpty()){
        throw validationError
    }

    const token = req.cookies.jwt
    if(!token){
        throw "token not found"
    }
    const decoded = jwt.verify(token, process.env.jwtKey);
    const email = decoded.email;
    if(!email){
        throw "Must Login First"
    }

    const patient = await PatientModel.findOne({userEmail : email})
    if(!patient){
        throw "Patient Not Found"
    }


    if (!isFollowup) {
        delete newDiagnosis.consultations
        }
        
        patient.Diagnosis.push(newDiagnosis);

        
        await patient.save();

        if (!isFollowup) {
            await PatientModel.updateOne(
                { userEmail: email, "Diagnosis._id": patient.Diagnosis[patient.Diagnosis.length - 1]._id },
                { $unset: { "Diagnosis.$.consultations": "" } }
            );
            }

        res.status(201).json({
            status: responseMsgs.SUCCESS,
            data: "Added Successfully",
            })

        console.log(patient.Diagnosis)
    }catch(er){
    console.log(er)
    errorHandler(res , er)
    }
}

const getDiagnosis = async (req,res)=>{

        const token = req.cookies.jwt
        const decoded = jwt.verify(token, process.env.jwtKey);
        const email = decoded.email;
        let Diagnosis = await PatientModel.findOne({userEmail:email}).select("Diagnosis")
        res.json(Diagnosis || {data : 'Not FOund'})
}

const updateDiagnosis = async (req,res)=>{

    let UpdateDiagnosistData = req.body
    const token = req.cookies.jwt
    const decoded = jwt.verify(token, process.env.jwtKey);
    const email = decoded.email;
    let update = await PatientModel.updateOne({userEmail : email})
    update.Diagnosis = await PatientModel.updateOne(UpdateDiagnosistData)
    console.log(update.Diagnosis)
    res.json(update.Diagnosis ? data='Updated Successfulyy' : data='Something wend Wrong')
}

const deletePrescription = async (req,res) =>{
    try{
    const prescriptionId = req.params.id
    const result = await PatientModel.updateOne(
        { "Diagnosis.prescription.prescriptionId": prescriptionId },
        {  $unset: { "Diagnosis.$.prescription": "" }})

        if(result.modifiedCount < 0){
            throw "Something went Wrong"
        }

        res.status(201).json({
            status: responseMsgs.SUCCESS,
            data: "Deleted Successfully",
          })

         }catch (err) {
            console.error(err);
            errorHandler(res,err)
          }
    
}

const updatePrescription = async (req, res) => {
    try {
      const newPrescriptionData = req.body
      const prescriptionId = req.params.id
  
      if (!prescriptionId) {
        throw "Prescription Id is required"
      }
  
      const result = await PatientModel.updateOne(
        { "Diagnosis.prescription.prescriptionId": prescriptionId }, { $set: { "Diagnosis.$.prescription": newPrescriptionData}})
  
      if (result.matchedCount === 0) {
        throw "Prescription not found"
      }
  
      res.status(201).json({
        status: responseMsgs.SUCCESS,
        data: "Updated Successfully",
      })

    } catch (err) {
      console.error(err);
      errorHandler(res,err)
    }
  }


const deleteconsultation= async (req,res) =>{
    try{
        const consultationId = req.params.id
        const result = await PatientModel.updateOne(
            { "Diagnosis.consultation.consultationId": consultationId },
            {  $unset: { "Diagnosis.$.consultation": "" }})
    
            if(result.modifiedCount < 0){
                throw "Something went Wrong"
            }
    
            res.status(201).json({
                status: responseMsgs.SUCCESS,
                data: "Deleted Successfully",
              })
    
             }catch (err) {
                console.error(err);
                errorHandler(res,err)
              }
    
}

const updateconsultation = async (req,res) =>{
    try {
        const newConsultationData = req.body
        const consultationId = req.params.id
    
        if (!consultationId) {
          throw "Consultation Id is required"
        }
    
        const result = await PatientModel.updateOne(
          { "Diagnosis.consultation.consultationId": consultationId }, { $set: { "Diagnosis.$.consultation": newConsultationData}})
    
        if (result.matchedCount === 0) {
          throw "Prescription not found"
        }
    
        res.status(201).json({
          status: responseMsgs.SUCCESS,
          data: "Updated Successfully",
        })
  
      } catch (err) {
        console.error(err);
        errorHandler(res,err)
      }
    
}

module.exports = {
    creatDiagnosis,
    getDiagnosis,
    updateDiagnosis,
    deletePrescription,
    updatePrescription,
    deleteconsultation,
    updateconsultation
}