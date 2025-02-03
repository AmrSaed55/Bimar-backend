import Appointments from "../models/AppointmentsModel.js";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/PatientAuth_Model.js";
import jwt from "jsonwebtoken";
import errorHandler from "../utilities/errorHandler.js";
import nodemailer from "nodemailer";
import responseMsgs from "../utilities/responseMsgs.js";

const createAppointemnt = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            throw "Token not found";
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const patientEmail = decoded.email;

        const patient = await Patient.findOne({ userEmail: patientEmail });
        if(!patient){
            throw "Patient not found";
        }

        const appointmentData = {
            ...req.body,
            patientId: patient._id,
        };

        const doctor = await Doctor.findById(req.body.doctorId);
        if(!doctor){
            throw "Doctor not found";
        }

        const existingAppointment = await Appointments.findOne({
            doctorId: doctor._id,
            appointmentDate: req.body.appointmentDate,
            $or: [
              { 
                appointmentStartTime: { $lt: new Date(req.body.appointmentEndTime) },
                appointmentEndTime: { $gt: new Date(req.body.appointmentStartTime) }
              }
            ]
        });

        if(existingAppointment){
            throw "The Appointment slot is already booked";
        }

        const appointment = await Appointments.create(appointmentData);
        res.status(200).json({
            message: responseMsgs.SUCCESS,
            appointment,
        });
        
        // send email to patient and doctor
        const transporter = nodemailer.createTransport({
            service: "gmail", 
            port: parseInt(process.env.EMAIL_PORT) || 587,
            auth: {
              user: process.env.USER,
              pass: process.env.PASS,
            },
        });

        const patientMailOptions = {
            from: "bimar.med24@gmail.com",
            to: patientEmail,
            subject: "Appointment Booked Successfully",
            html: ``
        };

        const doctorMailOptions = {
            from: "bimar.med24@gmail.com", 
            to: doctor.doctorEmail,
            subject: "New Appointment Scheduled",
            html: ``
        };
      
        await transporter.sendMail(patientMailOptions);
        await transporter.sendMail(doctorMailOptions);

        
    } catch (error) {
        console.log(error);
        errorHandler(res, error);
    }
}

const getAppointments = async (req, res) => {
    try{
        const token = req.cookies.jwt;
        if(!token){
            throw "Token not found";
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const email = decoded.email;

        //check if request from patient or doctor
        const patient = await Patient.findOne({ userEmail: email });
        const doctor = await Doctor.findOne({ doctorEmail: email });

        let appointments
        if(patient){
            appointments = await Appointments.find({ patientId: patient._id })
                // .populate('patientId', 'doctorName field clinic');
        }else if (doctor){
            appointments = await Appointments.find({ doctorId: doctor._id })
                // .populate('patientId', 'doctorName field clinic');
        }else{
            throw "User not found";
        }

        res.status(200).json({
            status: responseMsgs.SUCCESS,
            data:appointments
        });

    }catch(error){
        console.log(error);
        errorHandler(res, error);
    }
}

const updateAppointment = async(req,res) => {
    try{
        const appointmentData = req.body;
        const appointment = await Appointments.findByIdAndUpdate(
            appointmentData._id,
            appointmentData,
            { new: true } // Return updated document
          );
        if(!appointment){
            throw "Appointment not found";
        }

        res.status(200).json({
            status: responseMsgs.SUCCESS,
            data:appointment
        });

    }catch(err){
        console.log(err);
        errorHandler(res,err);
    }
}

const cancelAppointment = async(req,res) =>{
    try{
        const token = req.cookies.jwt;
        if(!token){
            throw "Token not provided";
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const email = decoded.email;

        const patient = await Patient.findOne({userEmail: email});
        const doctor = await Doctor.findOne({doctorEmail: email});
        if(!patient && !doctor){
            throw 'User not found';
        }

        const appointmentId = req.params.id;
        const appointment = await Appointments.findById(appointmentId);
        if(!appointment){
            throw "Appointment not found";
        }

        //verify ownership
        const isPatientOwner = patient && patient._id.equals(appointment.patientId);
        const isDoctorOwner = doctor && doctor._id.equals(appointment.doctorId);

        if(!isDoctorOwner && !isPatientOwner){
            throw "Unauthorized to delete this appointment";
        }

        await Appointments.findByIdAndDelete(appointmentId);

        res.status(200).json({
            status: responseMsgs.SUCCESS,
            data:appointment,
            message: "Appointement deleted sucessfully"
        });

        // send email to patient and doctor
        const transporter = nodemailer.createTransport({
            service: "gmail", 
            port: parseInt(process.env.EMAIL_PORT) || 587,
            auth: {
              user: process.env.USER,
              pass: process.env.PASS,
            },
        });

        const patientMailOptions = {
            from: "bimar.med24@gmail.com",
            to: patientEmail,
            subject: "Appointment Cancellation",
            html: ``
        };

        const doctorMailOptions = {
            from: "bimar.med24@gmail.com", 
            to: doctor.doctorEmail,
            subject: "New Appointment Scheduled",
            html: ``
        };
      
        await transporter.sendMail(patientMailOptions);
        await transporter.sendMail(doctorMailOptions);

    }catch(err){
        console.log(err);
        errorHandler(res,err);
    }
}

export default { 
    createAppointemnt,
    getAppointments,
    updateAppointment,
    cancelAppointment,
};
