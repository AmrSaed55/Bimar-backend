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
      Price: appointmentPrice,
    });

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: appointment,
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
                <!-- Header Section -->
                <div style="background-color: #16423C; padding: 30px; text-align: center;">
                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 0; font-weight: bold;">✅ Appointment Confirmed</h1>
                </div>

                <!-- Content Section -->
                <div style="padding: 30px;">
                    <h2 style="color: #333; font-size: 22px; margin-bottom: 15px;">Hello, ${patient.userName} 👋</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Your appointment with <strong>Dr. ${doctor.doctorName}</strong> has been successfully booked!
                    </p>
                    <div style="margin: 25px 0;">
                        <div style="background-color: #F0F4F9; padding: 20px; border-radius: 8px;">
                            <p style="margin: 5px 0; color: #16423C;"><strong>📅 Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>⏰ Time:</strong> ${new Date(appointmentStartTime).toLocaleTimeString()}</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>📍 Location:</strong> ${clinic.clinicAddress}</p>
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
                    You have a new appointment scheduled with <strong>${patient.userName}</strong>:
                </p>
                <div style="margin: 25px 0;">
                    <div style="background-color: #F0F4F9; padding: 20px; border-radius: 8px;">
                        <p style="margin: 5px 0; color: #16423C;"><strong>📅 Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
                        <p style="margin: 5px 0; color: #16423C;"><strong>⏰ Time:</strong> ${new Date(appointmentStartTime).toLocaleTimeString()}</p>
                        <p style="margin: 5px 0; color: #16423C;"><strong>📞 Contact:</strong> ${patient.userPhone}</p>
                        <p style="margin: 5px 0; color: #16423C;"><strong>✉️ Email:</strong> ${patient.userEmail}</p>
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

    // Check if request from patient or doctor
    const patient = await Patient.findOne({ userEmail: email });
    const doctor = await Doctor.findOne({ doctorEmail: email });

    let appointments;
    if (patient) {
      appointments = await Appointments.find({ patientId: patient._id })
        .populate('doctorId', 'doctorName field doctorImage')
        .populate('clinicId', 'clinicAddress clinicCity clinicArea');

      if (!appointments || appointments.length === 0) {
        return res.status(200).json({
          status: responseMsgs.SUCCESS,
          message: "You don't have any appointments yet. Book an appointment to get started!",
          data: null
        });
      }

    } else if (doctor) {
      appointments = await Appointments.find({ doctorId: doctor._id })
        .populate('patientId', 'userName profileImage userPhone userEmail');

      if (!appointments || appointments.length === 0) {
        return res.status(200).json({
          status: responseMsgs.SUCCESS,
          message: "You don't have any appointments scheduled yet.",
          data: null
        });
      }

    } else {
      throw "User not found";
    }

    // If we have appointments, return them with success status
    res.status(200).json({
      status: responseMsgs.SUCCESS,
      message: "Appointments retrieved successfully",
      data: appointments
    });

  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    
    // First get the appointment with populated data before update
    const oldAppointment = await Appointments.findById(appointmentData._id)
      .populate('patientId', 'userName userEmail')
      .populate('doctorId', 'doctorName doctorEmail');

    if (!oldAppointment) {
      throw "Appointment not found";
    }

    // Store email data before update
    const emailData = {
      patientName: oldAppointment.patientId?.userName,
      patientEmail: oldAppointment.patientId?.userEmail,
      doctorName: oldAppointment.doctorId?.doctorName,
      doctorEmail: oldAppointment.doctorId?.doctorEmail,
      oldDate: oldAppointment.appointmentDate,
      oldStartTime: oldAppointment.appointmentStartTime,
      newDate: appointmentData.appointmentDate || oldAppointment.appointmentDate,
      newStartTime: appointmentData.appointmentStartTime || oldAppointment.appointmentStartTime
    };

    // Update the appointment
    const updatedAppointment = await Appointments.findByIdAndUpdate(
      appointmentData._id,
      appointmentData,
      { new: true }
    );

    // Send success response immediately
    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: updatedAppointment,
      message: "Appointment updated successfully"
    });

    // Try to send notification emails
    try {
      // Validate email data
      if (!emailData.patientEmail && !emailData.doctorEmail) {
        console.log("No valid email recipients found");
        return;
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: parseInt(process.env.EMAIL_PORT) || 587,
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
      });

      const emailPromises = [];

      // Only send patient email if we have a valid patient email
      if (emailData.patientEmail) {
        const patientMailOptions = {
          from: "bimar.med24@gmail.com",
          to: emailData.patientEmail,
          subject: "Appointment Update Confirmation",
          html: ``
        };
        emailPromises.push(transporter.sendMail(patientMailOptions));
      }

      // Only send doctor email if we have a valid doctor email
      if (emailData.doctorEmail) {
        const doctorMailOptions = {
          from: "bimar.med24@gmail.com",
          to: emailData.doctorEmail,
          subject: "Appointment Update Notice",
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #F0F4F9; padding: 40px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); overflow: hidden; width: 100%;">
                    <div style="background-color: #16423C; padding: 30px; text-align: center;">
                        <h1 style="color: #FFFFFF; font-size: 28px; margin: 0; font-weight: bold;">🔄 Appointment Updated</h1>
                    </div>
                    <div style="padding: 30px;">
                        <h2 style="color: #333; font-size: 22px; margin-bottom: 15px;">Dr. ${emailData.doctorName || 'Doctor'}</h2>
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">
                            An appointment with patient <strong>${emailData.patientName || 'your patient'}</strong> has been updated.
                        </p>
                        <div style="margin: 25px 0;">
                            <div style="background-color: #F0F4F9; padding: 20px; border-radius: 8px;">
                                <p style="margin: 5px 0; color: #16423C;"><strong>Previous Date:</strong> ${new Date(emailData.oldDate).toLocaleDateString()}</p>
                                <p style="margin: 5px 0; color: #16423C;"><strong>Previous Time:</strong> ${new Date(emailData.oldStartTime).toLocaleTimeString()}</p>
                                <p style="margin: 15px 0 5px 0; color: #16423C;"><strong>New Date:</strong> ${new Date(emailData.newDate).toLocaleDateString()}</p>
                                <p style="margin: 5px 0; color: #16423C;"><strong>New Time:</strong> ${new Date(emailData.newStartTime).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                    <div style="background-color: #E1DEDE; text-align: center; padding: 20px; font-size: 14px; color: #777;">
                        <p style="margin: 0;">
                            Need assistance? Contact us at
                            <a href="mailto:bimar.med24@gmail.com" style="color: #16423C; text-decoration: underline;">bimar.med24@gmail.com</a>
                        </p>
                    </div>
                </div>
            </div>
          `
        };
        emailPromises.push(transporter.sendMail(doctorMailOptions));
      }

      // Send all valid emails
      if (emailPromises.length > 0) {
        await Promise.all(emailPromises);
        console.log("Update notification emails sent successfully");
      } else {
        console.log("No valid email recipients found");
      }

    } catch (emailError) {
      // Log email sending error but don't affect the main operation
      console.log("Error sending update notification emails:", emailError);
    }

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
    
    // Get appointment details before deletion
    const appointment = await Appointments.findById(appointmentId)
      .populate('patientId', 'userName userEmail')
      .populate('doctorId', 'doctorName doctorEmail');
      
    if (!appointment) {
      throw "Appointment not found";
    }

    //verify ownership
    const isPatientOwner = patient && patient._id.equals(appointment.patientId._id);
    const isDoctorOwner = doctor && doctor._id.equals(appointment.doctorId._id);

    if (!isDoctorOwner && !isPatientOwner) {
      throw "Unauthorized to delete this appointment";
    }

    // Validate and store email data before deletion
    const emailData = {
      patientName: appointment.patientId?.userName,
      patientEmail: appointment.patientId?.userEmail,
      doctorName: appointment.doctorId?.doctorName,
      doctorEmail: appointment.doctorId?.doctorEmail,
      appointmentDate: appointment.appointmentDate,
      appointmentStartTime: appointment.appointmentStartTime
    };

    // Log email data for debugging
    console.log("Email Data:", emailData);

    // Validate email data
    if (!emailData.patientEmail || !emailData.doctorEmail) {
      console.log("Missing email addresses:", {
        patientEmail: emailData.patientEmail,
        doctorEmail: emailData.doctorEmail
      });
    }

    // Delete the appointment
    await Appointments.findByIdAndDelete(appointmentId);

    // Send success response immediately
    res.status(200).json({
      status: responseMsgs.SUCCESS,
      message: "Appointment cancelled successfully"
    });

    // Try to send emails only if we have valid recipients
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: parseInt(process.env.EMAIL_PORT) || 587,
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
      });

      // Array to store email sending promises
      const emailPromises = [];

      // Only send patient email if we have a valid patient email
      if (emailData.patientEmail) {
        const patientMailOptions = {
          from: "bimar.med24@gmail.com",
          to: emailData.patientEmail,
          subject: "Appointment Cancellation",
          html: ``
        };
        emailPromises.push(transporter.sendMail(patientMailOptions));
      }

      // Only send doctor email if we have a valid doctor email
      if (emailData.doctorEmail) {
        const doctorMailOptions = {
          from: "bimar.med24@gmail.com",
          to: emailData.doctorEmail,
          subject: "Appointment Cancellation Notice",
          html: ``
        };
        emailPromises.push(transporter.sendMail(doctorMailOptions));
      }

      // Send all valid emails
      if (emailPromises.length > 0) {
        await Promise.all(emailPromises);
        console.log("Cancellation notification emails sent successfully");
      } else {
        console.log("No valid email recipients found");
      }

    } catch (emailError) {
      // Log email sending error but don't affect the main operation
      console.log("Error sending cancellation emails:", emailError);
    }

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
