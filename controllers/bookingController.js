import Appointments from "../models/AppointmentsModel.js";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/PatientAuth_Model.js";
import jwt from "jsonwebtoken";
import errorHandler from "../utilities/errorHandler.js";
import nodemailer from "nodemailer";
import responseMsgs from "../utilities/responseMsgs.js";

const createAppointemnt = async (req, res) => {
  try {
    // Verify token from cookies
    const token = req.cookies.jwt;
    if (!token) throw "Token not found";

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const patientEmail = decoded.email;

    // Fetch patient details from DB
    const patient = await Patient.findOne({ userEmail: patientEmail });
    if (!patient) throw "Patient not found";

    const {
      doctorId,
      clinicId,
      appointmentDate,
      appointmentStartTime,
      appointmentEndTime,
    } = req.body;

    // Fetch doctor from DB
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw "Doctor not found";

    // Find the selected clinic within the doctor's clinics
    const clinic = doctor.clinic.find((c) => c._id.toString() === clinicId);
    if (!clinic) throw "Invalid clinic ID for this doctor";

    // Fetch price from the CLINIC
    const appointmentPrice = clinic.Price;

    // Check for conflicting appointments
    const existingAppointment = await Appointments.findOne({
      doctorId: doctor._id,
      appointmentDate,
      $or: [
        {
          appointmentStartTime: { $lt: new Date(appointmentEndTime) },
          appointmentEndTime: { $gt: new Date(appointmentStartTime) },
        },
      ],
    });

    if (existingAppointment) throw "The Appointment slot is already booked";

    // Create appointment with fetched price
    const appointment = await Appointments.create({
      ...req.body,
      patientId: patient._id,
      Price: appointmentPrice, // Automatically set
    });

    // Send response
    res.status(200).json({
      message: responseMsgs.SUCCESS,
      appointment,
    });

    // Send confirmation email
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
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #F0F4F9; padding: 40px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); overflow: hidden; width: 100%;">
                <div style="background-color: #16423C; padding: 30px; text-align: center;">
                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 0; font-weight: bold;">✅ Appointment Confirmed</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #333; font-size: 22px; margin-bottom: 15px;">Hello, ${
                      patient.userName
                    } 👋</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Your appointment with <strong>Dr. ${
                          doctor.doctorName
                        }</strong> has been successfully booked!
                    </p>
                    <div style="margin: 25px 0;">
                        <div style="background-color: #F0F4F9; padding: 20px; border-radius: 8px;">
                            <p style="margin: 5px 0; color: #16423C;"><strong>📅 Date:</strong> ${new Date(
                              appointmentDate
                            ).toLocaleDateString()}</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>⏰ Time:</strong> ${new Date(
                              appointmentStartTime
                            ).toLocaleTimeString()} - ${new Date(
        appointmentEndTime
      ).toLocaleTimeString()}</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>📍 Location:</strong> ${
                              clinic.clinicAddress
                            }</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>💰 Price:</strong> ${appointmentPrice} EGP</p>
                        </div>
                    </div>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Please arrive 15 minutes before your scheduled time. For cancellations, kindly notify us at least 24 hours in advance.
                    </p>
                </div>
                <div style="background-color: #E1DEDE; text-align: center; padding: 20px; font-size: 14px; color: #777;">
                    <p style="margin: 0;">
                        Need to reschedule? Contact us at
                        <a href="mailto:bimar.med24@gmail.com" style="color: #16423C; text-decoration: underline;">bimar.med24@gmail.com</a>
                    </p>
                    <p style="margin-top: 8px;">&copy; 2024 <span style="color: #16423C; font-weight: bold;">Bimar</span>. All Rights Reserved.</p>
                </div>
            </div>
        </div>
      `,
    };

    await transporter.sendMail(patientMailOptions);
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const getAppointments = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      throw "Token not found";
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const email = decoded.email;

    //check if request from patient or doctor
    const patient = await Patient.findOne({ userEmail: email });
    const doctor = await Doctor.findOne({ doctorEmail: email });

    let appointments;
    if (patient) {
      appointments = await Appointments.find({ patientId: patient._id });
      // .populate('patientId', 'doctorName field clinic');
    } else if (doctor) {
      appointments = await Appointments.find({ doctorId: doctor._id });
      // .populate('patientId', 'doctorName field clinic');
    } else {
      throw "User not found";
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    const appointment = await Appointments.findByIdAndUpdate(
      appointmentData._id,
      appointmentData,
      { new: true } // Return updated document
    );
    if (!appointment) {
      throw "Appointment not found";
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: appointment,
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      throw "Token not provided";
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const email = decoded.email;

    const patient = await Patient.findOne({ userEmail: email });
    const doctor = await Doctor.findOne({ doctorEmail: email });
    if (!patient && !doctor) {
      throw "User not found";
    }

    const appointmentId = req.params.id;
    const appointment = await Appointments.findById(appointmentId);
    if (!appointment) {
      throw "Appointment not found";
    }

    //verify ownership
    const isPatientOwner = patient && patient._id.equals(appointment.patientId);
    const isDoctorOwner = doctor && doctor._id.equals(appointment.doctorId);

    if (!isDoctorOwner && !isPatientOwner) {
      throw "Unauthorized to delete this appointment";
    }

    await Appointments.findByIdAndDelete(appointmentId);

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: appointment,
      message: "Appointement deleted sucessfully",
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
      html: ``,
    };

    const doctorMailOptions = {
      from: "bimar.med24@gmail.com",
      to: doctor.doctorEmail,
      subject: "New Appointment Scheduled",
      html: ``,
    };

    await transporter.sendMail(patientMailOptions);
    await transporter.sendMail(doctorMailOptions);
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

export default {
  createAppointemnt,
  getAppointments,
  updateAppointment,
  cancelAppointment,
};
