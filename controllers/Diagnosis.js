import PatientModel from "../models/PatientAuth_Model.js";
import responseMsgs from "../utilities/responseMsgs.js";
import errorHandler from "../utilities/errorHandler.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
 const creatDiagnosis = async (req, res) => {
  try {

    const isFollowup = req.query.followup === 'true'

    // Extract file arrays with a fallback
    let xrayImgs = req.files?.Xray || []
    let labtestImgs = req.files?.labResults || []

    // Map file paths
    let xrayImgPaths = xrayImgs.map(file => file.path)
    let labtestImgPaths = labtestImgs.map(file => file.path)


    // Add file paths and consultations to new diagnosis
    let newDiagnosis = req.body
    newDiagnosis.Xray = xrayImgPaths
    newDiagnosis.labResults = labtestImgPaths

      if (!isFollowup) {
      delete newDiagnosis.consultations;
    }

    // Validation
    let validationError = validationResult(req)
    if (!validationError.isEmpty()) {
      throw validationError
    }

    // Token Verification
    const token = req.cookies.jwt
    if (!token) {
      throw "Token not found"
    }
    try {
      console.log("Current server time:", new Date());
      console.log("Token:", token);
      const decoded = jwt.verify(token, process.env.JWT_KEY)
      console.log("Decoded token:", decoded);
      const email = decoded.email
      if (!email) {
        throw "Must Login First"
      }
    } catch (error) {
      console.log("Token verification error:", error);
      throw "Token verification failed"
    }

    // Fetch Patient
    const patient = await PatientModel.findOne({ userEmail: email })
    if (!patient) {
      throw "Patient Not Found"
    }

    if (!isFollowup) {
      delete newDiagnosis.consultations;
    }

    // Save Diagnosis
    patient.Diagnosis.push(newDiagnosis)
    await patient.save()

    if (!isFollowup) {
      await PatientModel.updateOne(
        { userEmail: email, "Diagnosis._id": patient.Diagnosis[patient.Diagnosis.length - 1]._id },
        { $unset: { "Diagnosis.$.consultations": "" } }
      );
    }

    res.status(201).json({
      status: responseMsgs.SUCCESS,
      data: "Added Successfully",
    });

  } catch (err) {
    console.error(err)
    errorHandler(res, err)
  }
}

const createPrescription = async (req, res) => {
  try {
    let patientId = req.params.id;
    const prescriptionData = req.body; // Assuming the prescription data is in the request body

    const patient = await PatientModel.findOne({ _id: patientId });

    if (!patient) {
      return res.status(404).json({ data: 'Patient not found' });
    }

    // Create a new diagnosis entry with the prescription data and other fields set to null
    const newDiagnosis = {
      date: new Date(),
      doctorName: null,
      doctorPhone: null,
      diagnosis: [],
      treatmentPlan: null,
      Xray: [],
      labResults: [],
      prescription: {
        prescriptionId: uuidv4(),
        prescriptionDate: new Date(),
        followUpDate: prescriptionData.followUpDate,
        notes: prescriptionData.notes,
        prescriptionInstruction: prescriptionData.prescriptionInstruction,
        prescriptionStatus: "Pending",
      },
      
      consultations: [],
    };

    // If followUpDate is null, delete the consultations field
    // if (!prescriptionData.followUpDate) {
    //   delete newDiagnosis.consultations;
    // }

    // Add the new diagnosis entry to the patient's diagnosis array
    patient.Diagnosis.push(newDiagnosis);
    await patient.save();

    if (!prescriptionData.followUpDate) {
      await PatientModel.updateOne(
        { _id: patientId, "Diagnosis._id": patient.Diagnosis[patient.Diagnosis.length - 1]._id },
        { $unset: { "Diagnosis.$.consultations": "" } }
      );
    }

    res.status(201).json({ data: 'Prescription added successfully' });
  } catch (error) {
    console.error("Error creating prescription:", error);
    res.status(500).json({ data: 'Something went wrong' });
  }
};

 const getDiagnosis = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      
      // Use userId instead of email for finding the patient
      const patient = await PatientModel.findById(decoded.userId).select("Diagnosis");
      
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      
      res.json(patient || { data: 'Not Found' });
      
    } catch (jwtError) {
      console.log("JWT Error:", jwtError);
      
      // Clear the expired token
      res.clearCookie('jwt');
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: "Token expired", 
          message: "Please log in again to refresh your session"
        });
      }
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.log("General error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

 const updateDiagnosis = async (req,res)=>{

    let UpdateDiagnosistData = req.body
    const token = req.cookies.jwt
    const decoded = jwt.verify(token, process.env.JWT_KEY);
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

const getSpecificDiagnosis = async (req, res) => {
  try {
    const { patientId, diagnosisId } = req.params;
    
    // Verify token and authorization
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      
      // Find the patient
      const patient = await PatientModel.findById(patientId);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      // Check authorization - only allow if the requester is the patient or a doctor
      if (decoded.role !== "Doctor" && decoded.userId !== patientId) {
        return res.status(403).json({ error: "Not authorized to access this diagnosis" });
      }

      // Find the specific diagnosis in the array
      const diagnosis = patient.Diagnosis.find(d => d._id.toString() === diagnosisId);
      if (!diagnosis) {
        return res.status(404).json({ error: "Diagnosis not found" });
      }

      // Format the response to match the expected structure
      const formattedDiagnosis = {
        id: diagnosis._id,
        date: diagnosis.date,
        doctorName: diagnosis.doctorName,
        diagnosis: diagnosis.diagnosis,
        treatmentPlan: diagnosis.treatmentPlan,
        hasXray: Array.isArray(diagnosis.Xray) && diagnosis.Xray.length > 0,
        hasLabResults: Array.isArray(diagnosis.labResults) && diagnosis.labResults.length > 0,
        hasPrescription: !!diagnosis.prescription,
        displayDate: new Date(diagnosis.date).toLocaleDateString(),
        // Include all other diagnosis fields
        ...diagnosis.toObject()
      };

      res.status(200).json({
        status: "success",
        data: formattedDiagnosis
      });

    } catch (jwtError) {
      console.log("JWT Error:", jwtError);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: "Token expired", 
          message: "Please log in again to refresh your session"
        });
      }
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.log("Error in getSpecificDiagnosis:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export default {
  creatDiagnosis,
    getDiagnosis,
    updateDiagnosis,
    deletePrescription,
    updatePrescription,
    deleteconsultation,
    updateconsultation,
    createPrescription,
    getSpecificDiagnosis
}
