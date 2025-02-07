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
    if (!token) {
      throw "Token not found";
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const patientEmail = decoded.email;

    const patient = await Patient.findOne({ userEmail: patientEmail });
    if (!patient) {
      throw "Patient not found";
    }

    const patientName = patient.userName;
    const patientPhone = patient.userPhone;
    const appointmentDate = new Date(req.body.appointmentDate).toLocaleDateString();
    const appointmentStartTime = new Date(req.body.appointmentStartTime).toLocaleTimeString();
    const appointmentData = {
      ...req.body,
      patientId: patient._id,
    };

    const doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) {
      throw "Doctor not found";
    }

    const clinic = doctor.clinic.find(c => c._id.toString() === req.body.clinicId);
    const clinicAddress = clinic ? clinic.clinicAddress : 'Address not available';

    const existingAppointment = await Appointments.findOne({
      doctorId: doctor._id,
      appointmentDate: req.body.appointmentDate,
      $or: [
        {
          appointmentStartTime: { $lt: new Date(req.body.appointmentEndTime) },
          appointmentEndTime: { $gt: new Date(req.body.appointmentStartTime) },
        },
      ],
    });

    if (existingAppointment) {
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
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #F0F4F9; padding: 40px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); overflow: hidden; width: 100%;">

                <!-- Header Section -->
                <div style="background-color: #16423C; padding: 30px; text-align: center;">
                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 0; font-weight: bold;">✅ Appointment Confirmed</h1>
                </div>

                <!-- Content Section -->
                <div style="padding: 30px;">
                    <h2 style="color: #333; font-size: 22px; margin-bottom: 15px;">Hello, ${patientName} 👋</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Your appointment with <strong>Dr. ${doctor.doctorName}</strong> has been successfully booked!
                    </p>
                    <div style="margin: 25px 0;">
                        <div style="background-color: #F0F4F9; padding: 20px; border-radius: 8px;">
                            <p style="margin: 5px 0; color: #16423C;"><strong>📅 Date:</strong> ${appointmentDate}</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>⏰ Time:</strong> ${appointmentStartTime}</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>📍 Location:</strong> ${clinicAddress}</p>
                        </div>
                    </div>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Please arrive 15 minutes before your scheduled time. For cancellations, kindly notify us at least 24 hours in advance.
                    </p>
                </div>

                <!-- Footer Section -->
                <div style="background-color: #E1DEDE; text-align: center; padding: 20px; font-size: 14px; color: #777;">
                    <p style="margin: 0;">
                        Need to reschedule? Contact us at
                        <a href="mailto:bimar.med24@gmail.com" style="color: #16423C; text-decoration: underline;">bimar.med24@gmail.com</a>
                    </p>
                    <p style="margin-top: 8px;">&copy; 2024 <span style="color: #16423C; font-weight: bold;">Bimar</span>. All Rights Reserved.</p>
                </div>
            </div>
        </div>

        <!-- Media Query -->
        <style>
            @media only screen and (max-width: 600px) {
                div[style*="padding: 40px;"] {
                    padding: 20px !important;
                }

                div[style*="padding: 30px;"] {
                    padding: 20px !important;
                }

                h1, h2 {
                    font-size: 20px !important;
                }

                p, a {
                    font-size: 14px !important;
                }

                span[style*="font-size: 28px;"] {
                    font-size: 20px !important;
                    padding: 10px 20px !important;
                }

                a[style*="padding: 14px 40px;"] {
                    padding: 10px 20px !important;
                }
            }
        </style>
        `,
    };

    const doctorMailOptions = {
      from: "bimar.med24@gmail.com",
      to: doctor.doctorEmail,
      subject: "New Appointment Scheduled",
      html: `
       <div style="font-family: Arial, sans-serif; background-color: #F0F4F9; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); overflow: hidden; width: 100%;">

            <!-- Header Section -->
            <div style="background-color: #16423C; padding: 30px; text-align: center;">
                <h1 style="color: #FFFFFF; font-size: 28px; margin: 0; font-weight: bold;">🩺 New Appointment</h1>
            </div>

            <!-- Content Section -->
            <div style="padding: 30px;">
                <h2 style="color: #333; font-size: 22px; margin-bottom: 15px;">Dr. ${doctor.doctorName}</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                    You have a new appointment scheduled with <strong>${patientName}</strong>:
                </p>
                <div style="margin: 25px 0;">
                    <div style="background-color: #F0F4F9; padding: 20px; border-radius: 8px;">
                        <p style="margin: 5px 0; color: #16423C;"><strong>📅 Date:</strong> ${appointmentDate}</p>
                        <p style="margin: 5px 0; color: #16423C;"><strong>⏰ Time:</strong> ${appointmentStartTime}</p>
                        <p style="margin: 5px 0; color: #16423C;"><strong>📞 Contact:</strong> ${patientPhone}</p>
                        <p style="margin: 5px 0; color: #16423C;"><strong>✉️ Email:</strong> ${patientEmail}</p>
                    </div>
                </div>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                    Please review the patient's medical history in your dashboard and prepare any necessary documents.
                </p>
            </div>

            <!-- Footer Section -->
            <div style="background-color: #E1DEDE; text-align: center; padding: 20px; font-size: 14px; color: #777;">
                <p style="margin: 0;">
                    Need assistance? Contact us at
                    <a href="mailto:bimar.med24@gmail.com" style="color: #16423C; text-decoration: underline;">bimar.med24@gmail.com</a>
                </p>
                <p style="margin-top: 8px;">&copy; 2024 <span style="color: #16423C; font-weight: bold;">Bimar</span>. All Rights Reserved.</p>
            </div>
        </div>
    </div>
    <!-- Media Query -->
    <style>
         @media only screen and (max-width: 600px) {
                div[style*="padding: 40px;"] {
                    padding: 20px !important;
                }

                div[style*="padding: 30px;"] {
                    padding: 20px !important;
                }

                h1, h2 {
                    font-size: 20px !important;
                }

                p, a {
                    font-size: 14px !important;
                }

                span[style*="font-size: 28px;"] {
                    font-size: 20px !important;
                    padding: 10px 20px !important;
                }

                a[style*="padding: 14px 40px;"] {
                    padding: 10px 20px !important;
                }
            }
    </style>
      `,
    };

    await transporter.sendMail(patientMailOptions);
    await transporter.sendMail(doctorMailOptions);
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
