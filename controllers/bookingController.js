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
    const patient = await Patient.findById(decoded.userId);
    if (!patient) throw "Patient not found";

    const {
      doctorId,
      clinicId,
      appointmentDate,
      paymentMethod = "Cash", // Default to Cash if not specified
      paymentDetails = {}, // Optional payment details
    } = req.body;

    // Fetch doctor from DB
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw "Doctor not found";

    // Find the selected clinic within the doctor's clinics
    const clinic = doctor.clinic.find((c) => c._id.toString() === clinicId);
    if (!clinic) throw "Invalid clinic ID for this doctor";

    // Fetch price from the CLINIC
    const appointmentPrice = clinic.Price;

    // Calculate tax (assuming 15% VAT)
    const taxAmount = appointmentPrice * 0.15;
    const totalAmount = appointmentPrice + taxAmount;

    // Generate unique receipt number (format: RCP-YYYYMMDD-XXXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0,10).replace(/-/g,'');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `RCP-${dateStr}-${randomNum}`;

    // Get the count of existing appointments for this clinic on this date
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointmentsCount = await Appointments.countDocuments({
      clinicId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Check if we've reached the maximum number of bookings for this day
    const workDay = clinic.clinicWorkDays.find(day => 
      day.day === new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long' })
    );

    if (!workDay) {
      throw "Clinic is not open on this day";
    }

    if (existingAppointmentsCount >= workDay.NoBookings) {
      throw "No more booking slots available for this day";
    }

    // Check if patient already has an ACTIVE appointment on this date
    const existingPatientAppointment = await Appointments.findOne({
      patientId: patient._id,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $ne: "Cancelled" }  // Only check for non-cancelled appointments
    });

    if (existingPatientAppointment) {
      throw "You already have an active appointment scheduled for this day. Please choose a different date.";
    }

    // Extract the start time from working hours
    // Working hours format: ["14:00 - 17:00"] - we need the start time "14:00"
    const workingHoursString = workDay.workingHours[0]; // e.g., "14:00 - 17:00"
    const appointmentStartTime = workingHoursString.split(' - ')[0]; // Extract "14:00"

    // Create appointment with receipt information
    const appointment = await Appointments.create({
      patientId: patient._id,
      doctorId,
      clinicId,
      appointmentDate,
      appointmentStartTime,
      bookingNumber: existingAppointmentsCount + 1,
      Price: appointmentPrice,
      bookingType: req.body.bookingType || "first-Visit",
      receipt: {
        receiptNumber,
        issueDate: new Date(),
        paymentMethod,
        paymentDetails,
        taxAmount,
        totalAmount,
        notes: req.body.notes || "Initial appointment booking"
      }
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
      to: patient.userEmail,
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
                            <p style="margin: 5px 0; color: #16423C;"><strong>📅 Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>🔢 Your Booking Number:</strong> ${appointment.bookingNumber}</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>⏰ Clinic Working Hours:</strong> ${workDay.workingHours.join(' - ')}</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>📍 Location:</strong> ${clinic.clinicAddress}, ${clinic.clinicArea}, ${clinic.clinicCity}</p>
                        </div>
                        <!-- Receipt Section -->
                        <div style="margin-top: 20px; background-color: #E8F4FE; padding: 20px; border-radius: 8px;">
                            <h3 style="color: #0A558C; margin: 0 0 10px 0;">Receipt Details</h3>
                            <p style="margin: 5px 0; color: #16423C;"><strong>Receipt Number:</strong> ${receiptNumber}</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>Payment Method:</strong> ${paymentMethod}</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>Appointment Fee:</strong> $${appointmentPrice.toFixed(2)}</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>Tax (15%):</strong> $${taxAmount.toFixed(2)}</p>
                            <p style="margin: 5px 0; color: #16423C;"><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
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
                <h2 style="color: #333; font-size: 22px; margin-bottom: 15px;">Dr. ${
                  doctor.doctorName
                }</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                    A new appointment has been scheduled at your clinic.
                </p>
                <div style="margin: 25px 0;">
                    <div style="background-color: #F0F4F9; padding: 20px; border-radius: 8px;">
                        <p style="margin: 5px 0; color: #16423C;"><strong>📅 Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
                        <p style="margin: 5px 0; color: #16423C;"><strong>🔢 Booking Number:</strong> ${appointment.bookingNumber}</p>
                        <p style="margin: 5px 0; color: #16423C;"><strong>👤 Patient Name:</strong> ${patient.userName}</p>
                        <p style="margin: 5px 0; color: #16423C;"><strong>📞 Patient Phone:</strong> ${patient.userPhone}</p>
                        <p style="margin: 5px 0; color: #16423C;"><strong>✉️ Patient Email:</strong> ${patient.userEmail}</p>
                    </div>
                    <!-- Receipt Section -->
                    <div style="margin-top: 20px; background-color: #E8F4FE; padding: 20px; border-radius: 8px;">
                        <h3 style="color: #0A558C; margin: 0 0 10px 0;">Payment Details</h3>
                        <p style="margin: 5px 0; color: #16423C;"><strong>Receipt Number:</strong> ${receiptNumber}</p>
                        <p style="margin: 5px 0; color: #16423C;"><strong>Payment Method:</strong> ${paymentMethod}</p>
                        <p style="margin: 5px 0; color: #16423C;"><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
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
    const userId = decoded.userId;

    // Check if request from patient or doctor
    const patient = await Patient.findById(userId);
    const doctor = await Doctor.findById(userId);

    let appointments;
    if (patient) {
      appointments = await Appointments.find({ patientId: patient._id })
        .populate("doctorId", "doctorName field doctorImage")
        .populate("clinicId", "clinicAddress clinicCity clinicArea");

      if (!appointments || appointments.length === 0) {
        return res.status(200).json({
          status: responseMsgs.SUCCESS,
          message:
            "You don't have any appointments yet. Book an appointment to get started!",
          data: null,
        });
      }
    } else if (doctor) {
      appointments = await Appointments.find({ doctorId: doctor._id }).populate(
        "patientId",
        "userName profileImage userPhone userEmail"
      );

      if (!appointments || appointments.length === 0) {
        return res.status(200).json({
          status: responseMsgs.SUCCESS,
          message: "You don't have any appointments scheduled yet.",
          data: null,
        });
      }
    } else {
      throw "User not found";
    }

    // If we have appointments, return them with success status
    res.status(200).json({
      status: responseMsgs.SUCCESS,
      message: "Appointments retrieved successfully",
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

    // First get the appointment with populated data before update
    const oldAppointment = await Appointments.findById(appointmentData._id)
      .populate("patientId", "userName userEmail")
      .populate("doctorId", "doctorName doctorEmail");

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
      newDate: appointmentData.appointmentDate || oldAppointment.appointmentDate,
      oldReceipt: oldAppointment.receipt,
    };

    // Handle receipt updates if provided
    if (appointmentData.receipt) {
      // If updating payment method or details
      if (appointmentData.receipt.paymentMethod || appointmentData.receipt.paymentDetails) {
        appointmentData.receipt = {
          ...oldAppointment.receipt,
          ...appointmentData.receipt,
          // Keep the original receipt number and issue date
          receiptNumber: oldAppointment.receipt.receiptNumber,
          issueDate: oldAppointment.receipt.issueDate,
        };
      }

      // If updating price, recalculate tax and total
      if (appointmentData.Price) {
        const taxAmount = appointmentData.Price * 0.15;
        appointmentData.receipt = {
          ...appointmentData.receipt,
          taxAmount,
          totalAmount: appointmentData.Price + taxAmount,
        };
      }
    }

    // If the appointment date is being changed
    if (appointmentData.appointmentDate && 
        appointmentData.appointmentDate !== oldAppointment.appointmentDate.toISOString()) {
      
      // 1. Get the old date's appointments after this booking number
      const oldDateStart = new Date(oldAppointment.appointmentDate);
      oldDateStart.setHours(0, 0, 0, 0);
      const oldDateEnd = new Date(oldAppointment.appointmentDate);
      oldDateEnd.setHours(23, 59, 59, 999);

      // Find appointments on the old date with higher booking numbers
      const appointmentsToUpdate = await Appointments.find({
        clinicId: oldAppointment.clinicId,
        appointmentDate: {
          $gte: oldDateStart,
          $lte: oldDateEnd
        },
        bookingNumber: { $gt: oldAppointment.bookingNumber }
      });

      // 2. Decrease booking numbers for remaining appointments on old date
      for (const apt of appointmentsToUpdate) {
        await Appointments.findByIdAndUpdate(apt._id, {
          $inc: { bookingNumber: -1 }
        });
      }

      // 3. Get count of appointments on new date to determine new booking number
      const newDateStart = new Date(appointmentData.appointmentDate);
      newDateStart.setHours(0, 0, 0, 0);
      const newDateEnd = new Date(appointmentData.appointmentDate);
      newDateEnd.setHours(23, 59, 59, 999);

      const newDateAppointmentsCount = await Appointments.countDocuments({
        clinicId: oldAppointment.clinicId,
        appointmentDate: {
          $gte: newDateStart,
          $lte: newDateEnd
        }
      });

      // 4. Check if the new date has available slots
      const doctor = await Doctor.findById(oldAppointment.doctorId);
      const clinic = doctor.clinic.find(c => c._id.toString() === oldAppointment.clinicId.toString());
      const newDateWorkDay = clinic.clinicWorkDays.find(day => 
        day.day === new Date(appointmentData.appointmentDate).toLocaleDateString('en-US', { weekday: 'long' })
      );

      if (!newDateWorkDay) {
        throw "Clinic is not open on the selected day";
      }

      if (newDateAppointmentsCount >= newDateWorkDay.NoBookings) {
        throw "No more booking slots available for the selected date";
      }

      // 5. Assign new booking number
      appointmentData.bookingNumber = newDateAppointmentsCount + 1;
      
      // 6. Extract and assign new appointment start time from new date's working hours
      const newWorkingHoursString = newDateWorkDay.workingHours[0];
      appointmentData.appointmentStartTime = newWorkingHoursString.split(' - ')[0];
    }

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
      message: "Appointment updated successfully",
    });

    // Send notification emails
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: parseInt(process.env.EMAIL_PORT) || 587,
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
      });

      // Get working hours for the new date
      const doctor = await Doctor.findById(oldAppointment.doctorId);
      const clinic = doctor.clinic.find(c => c._id.toString() === oldAppointment.clinicId.toString());
      const workDay = clinic.clinicWorkDays.find(day => 
        day.day === new Date(updatedAppointment.appointmentDate).toLocaleDateString('en-US', { weekday: 'long' })
      );

      if (emailData.patientEmail) {
        const patientMailOptions = {
          from: "bimar.med24@gmail.com",
          to: emailData.patientEmail,
          subject: "Appointment Update Confirmation",
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #F0F4F9; padding: 40px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); overflow: hidden; width: 100%;">
                    <div style="background-color: #16423C; padding: 30px; text-align: center;">
                        <h1 style="color: #FFFFFF; font-size: 28px; margin: 0; font-weight: bold;">🔄 Appointment Updated</h1>
                    </div>
                    <div style="padding: 30px;">
                        <h2 style="color: #333; font-size: 22px; margin-bottom: 15px;">Hello, ${emailData.patientName}</h2>
                        <div style="margin: 25px 0;">
                            <div style="background-color: #F0F4F9; padding: 20px; border-radius: 8px;">
                                <p style="margin: 5px 0; color: #16423C;"><strong>📅 New Date:</strong> ${new Date(updatedAppointment.appointmentDate).toLocaleDateString()}</p>
                                <p style="margin: 5px 0; color: #16423C;"><strong>🔢 New Booking Number:</strong> ${updatedAppointment.bookingNumber}</p>
                                <p style="margin: 5px 0; color: #16423C;"><strong>⏰ Clinic Working Hours:</strong> ${workDay.workingHours.join(' - ')}</p>
                            </div>
                            ${updatedAppointment.receipt ? `
                            <div style="margin-top: 20px; background-color: #E8F4FE; padding: 20px; border-radius: 8px;">
                                <h3 style="color: #0A558C; margin: 0 0 10px 0;">Updated Receipt Details</h3>
                                <p style="margin: 5px 0; color: #16423C;"><strong>Receipt Number:</strong> ${updatedAppointment.receipt.receiptNumber}</p>
                                <p style="margin: 5px 0; color: #16423C;"><strong>Payment Method:</strong> ${updatedAppointment.receipt.paymentMethod}</p>
                                <p style="margin: 5px 0; color: #16423C;"><strong>Appointment Fee:</strong> $${updatedAppointment.Price.toFixed(2)}</p>
                                <p style="margin: 5px 0; color: #16423C;"><strong>Tax (15%):</strong> $${updatedAppointment.receipt.taxAmount.toFixed(2)}</p>
                                <p style="margin: 5px 0; color: #16423C;"><strong>Total Amount:</strong> $${updatedAppointment.receipt.totalAmount.toFixed(2)}</p>
                            </div>
                            ` : ''}
                            <div style="margin-top: 20px; background-color: #E8F4FE; padding: 20px; border-radius: 8px;">
                                <h3 style="color: #0A558C; margin: 0 0 10px 0;">Previous Details</h3>
                                <p style="margin: 5px 0; color: #16423C;"><strong>Previous Date:</strong> ${new Date(emailData.oldDate).toLocaleDateString()}</p>
                                ${emailData.oldReceipt ? `
                                <p style="margin: 5px 0; color: #16423C;"><strong>Previous Total Amount:</strong> $${emailData.oldReceipt.totalAmount.toFixed(2)}</p>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          `
        };
        await transporter.sendMail(patientMailOptions);
      }

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
                        <h2 style="color: #333; font-size: 22px; margin-bottom: 15px;">Hello, Dr. ${emailData.doctorName}</h2>
                        <div style="margin: 25px 0;">
                            <div style="background-color: #F0F4F9; padding: 20px; border-radius: 8px;">
                                <p style="margin: 5px 0; color: #16423C;"><strong>👤 Patient:</strong> ${emailData.patientName}</p>
                                <p style="margin: 5px 0; color: #16423C;"><strong>📅 New Date:</strong> ${new Date(updatedAppointment.appointmentDate).toLocaleDateString()}</p>
                                <p style="margin: 5px 0; color: #16423C;"><strong>🔢 New Booking Number:</strong> ${updatedAppointment.bookingNumber}</p>
                                <p style="margin: 5px 0; color: #16423C;"><strong>⏰ Clinic Working Hours:</strong> ${workDay.workingHours.join(' - ')}</p>
                            </div>
                            ${updatedAppointment.receipt ? `
                            <div style="margin-top: 20px; background-color: #E8F4FE; padding: 20px; border-radius: 8px;">
                                <h3 style="color: #0A558C; margin: 0 0 10px 0;">Updated Payment Details</h3>
                                <p style="margin: 5px 0; color: #16423C;"><strong>Receipt Number:</strong> ${updatedAppointment.receipt.receiptNumber}</p>
                                <p style="margin: 5px 0; color: #16423C;"><strong>Payment Method:</strong> ${updatedAppointment.receipt.paymentMethod}</p>
                                <p style="margin: 5px 0; color: #16423C;"><strong>Total Amount:</strong> $${updatedAppointment.receipt.totalAmount.toFixed(2)}</p>
                            </div>
                            ` : ''}
                            <div style="margin-top: 20px; background-color: #E8F4FE; padding: 20px; border-radius: 8px;">
                                <h3 style="color: #0A558C; margin: 0 0 10px 0;">Previous Details</h3>
                                <p style="margin: 5px 0; color: #16423C;"><strong>Previous Date:</strong> ${new Date(emailData.oldDate).toLocaleDateString()}</p>
                                ${emailData.oldReceipt ? `
                                <p style="margin: 5px 0; color: #16423C;"><strong>Previous Total Amount:</strong> $${emailData.oldReceipt.totalAmount.toFixed(2)}</p>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          `
        };
        await transporter.sendMail(doctorMailOptions);
      }
    } catch (emailError) {
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
    const userId = decoded.userId;

    const patient = await Patient.findById(userId);
    const doctor = await Doctor.findById(userId);
    if (!patient && !doctor) {
      throw "User not found";
    }

    const appointmentId = req.params.id;

    // Get appointment details before update
    const appointment = await Appointments.findById(appointmentId)
      .populate("patientId", "userName userEmail")
      .populate("doctorId", "doctorName doctorEmail");

    if (!appointment) {
      throw "Appointment not found";
    }

    // Verify ownership
    const isPatientOwner = patient && patient._id.equals(appointment.patientId._id);
    const isDoctorOwner = doctor && doctor._id.equals(appointment.doctorId._id);

    if (!isDoctorOwner && !isPatientOwner) {
      throw "Unauthorized to cancel this appointment";
    }

    // Update the booking numbers for other appointments on the same day
    const appointmentDate = new Date(appointment.appointmentDate);
    const dayStart = new Date(appointmentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(appointmentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const appointmentsToUpdate = await Appointments.find({
      clinicId: appointment.clinicId,
      appointmentDate: {
        $gte: dayStart,
        $lte: dayEnd
      },
      status: { $ne: "Cancelled" }, // Only update active appointments
      bookingNumber: { $gt: appointment.bookingNumber }
    });

    // Update the appointment status to cancelled
    await Appointments.findByIdAndUpdate(appointmentId, {
      status: "Cancelled",
    });

    // Update booking numbers for remaining appointments
    for (const apt of appointmentsToUpdate) {
      await Appointments.findByIdAndUpdate(apt._id, {
        $inc: { bookingNumber: -1 }
      });
    }

    // Send success response immediately
    res.status(200).json({
      status: responseMsgs.SUCCESS,
      message: "Appointment cancelled successfully",
    });

    // Validate and store email data
    const emailData = {
      patientName: appointment.patientId?.userName,
      patientEmail: appointment.patientId?.userEmail,
      doctorName: appointment.doctorId?.doctorName,
      doctorEmail: appointment.doctorId?.doctorEmail,
      appointmentDate: appointment.appointmentDate,
      bookingNumber: appointment.bookingNumber
    };

      // Try to send emails
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
            html: ``,
          };
          emailPromises.push(transporter.sendMail(patientMailOptions));
        }
  
        // Only send doctor email if we have a valid doctor email
        if (emailData.doctorEmail) {
          const doctorMailOptions = {
            from: "bimar.med24@gmail.com",
            to: emailData.doctorEmail,
            subject: "Appointment Cancellation Notice",
            html: ``,
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

const createFollowUpAppointment = async (req, res) => {
  try {
    // Verify doctor's token
    const token = req.cookies.jwt;
    if (!token) throw "Token not provided";

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const doctor = await Doctor.findById(decoded.userId);
    if (!doctor) throw "Unauthorized: Only doctors can create follow-up appointments";

    const {
      patientId,
      clinicId,
      appointmentDate,
    } = req.body;

    // Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) throw "Patient not found";

    // Check if patient has had a previous appointment with this doctor
    const previousAppointment = await Appointments.findOne({
      patientId: patientId,
      doctorId: doctor._id,
      status: "Completed",  // Only consider completed appointments
      appointmentDate: { $lt: new Date() }  // Only consider past appointments
    });

    if (!previousAppointment) {
      throw "Cannot create follow-up: No previous appointments found with this patient";
    }

    // Check for same day appointments
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingFollowUp = await Appointments.findOne({
      patientId: patientId,
      doctorId: doctor._id,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      bookingType: "follow-up"
    });

    if (existingFollowUp) {
      throw "This patient already has a follow-up appointment scheduled for this day";
    }

    // Find the selected clinic within the doctor's clinics
    const clinic = doctor.clinic.find((c) => c._id.toString() === clinicId);
    if (!clinic) throw "Invalid clinic ID for this doctor";

    // Get existing appointments count for this date
    const existingAppointmentsCount = await Appointments.countDocuments({
      clinicId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Check clinic availability
    const workDay = clinic.clinicWorkDays.find(day => 
      day.day === new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long' })
    );

    if (!workDay) {
      throw "Clinic is not open on this day";
    }

    if (existingAppointmentsCount >= workDay.NoBookings) {
      throw "No more booking slots available for this day";
    }

    // Create the follow-up appointment
    const appointment = await Appointments.create({
      patientId: patient._id,
      doctorId: doctor._id,
      clinicId,
      appointmentDate,
      bookingNumber: existingAppointmentsCount + 1,
      Price: clinic.Price, //!!follow up price might be changed 
      bookingType: "follow-up"
    });

    // Send success response
    res.status(200).json({
      status: "success",
      data: appointment,
      message: "Follow-up appointment created successfully"
    });

    // Send notification emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    // Patient email notification
    const patientMailOptions = {
      from: "bimar.med24@gmail.com",
      to: patient.userEmail,
      subject: "Follow-up Appointment Scheduled",
      html: ``
    };

    // Doctor confirmation email
    const doctorMailOptions = {
      from: "bimar.med24@gmail.com",
      to: doctor.doctorEmail,
      subject: "Follow-up Appointment Confirmation",
      html: ``
    };

    await Promise.all([
      transporter.sendMail(patientMailOptions),
      transporter.sendMail(doctorMailOptions)
    ]);

  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

// Modify the deleteAppointment function to only allow the doctor who created the appointment
const deleteAppointment = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      throw "Token not provided";
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const doctorId = decoded.userId;

    // Verify the user is a doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw "Unauthorized: Only doctors can delete appointments";
    }

    const appointmentId = req.params.id;
    const appointment = await Appointments.findById(appointmentId);
    
    if (!appointment) {
      throw "Appointment not found";
    }

    // Check if this doctor owns the appointment
    if (!appointment.doctorId.equals(doctorId)) {
      throw "Unauthorized: You can only delete appointments you created";
    }

    // Delete the appointment
    await Appointments.findByIdAndDelete(appointmentId);

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      message: "Appointment permanently deleted",
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

const getReceiptDetails = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      throw "Token not provided";
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userId = decoded.userId;

    // Get appointment ID from request params
    const appointmentId = req.params.id;

    // Find appointment and populate necessary fields
    const appointment = await Appointments.findById(appointmentId)
      .populate("doctorId", "doctorName doctorEmail field clinic")
      .populate("patientId", "userName userEmail userPhone");

    if (!appointment) {
      throw "Appointment not found";
    }

    // Verify if the requesting user is either the patient or the doctor
    const isPatient = appointment.patientId?._id.equals(userId);
    const isDoctor = appointment.doctorId?._id.equals(userId);

    if (!isPatient && !isDoctor) {
      throw "Unauthorized: You can only view receipts for your own appointments";
    }

    // Check if receipt exists
    if (!appointment.receipt) {
      throw "Receipt not found for this appointment";
    }

    // Find the specific clinic from doctor's clinics array
    const doctor = appointment.doctorId;
    const clinic = doctor?.clinic?.find(c => c._id.toString() === appointment.clinicId.toString());

    // Format the receipt data with null checks
    const receiptData = {
      receiptNumber: appointment.receipt.receiptNumber || "N/A",
      issueDate: appointment.receipt.issueDate || new Date(),
      appointmentDate: appointment.appointmentDate,
      bookingNumber: appointment.bookingNumber,
      doctor: {
        name: doctor?.doctorName || "N/A",
        specialization: doctor?.field || "N/A",
        email: doctor?.doctorEmail || "N/A"
      },
      patient: {
        name: appointment.patientId?.userName || "N/A",
        email: appointment.patientId?.userEmail || "N/A",
        phone: appointment.patientId?.userPhone || "N/A"
      },
      clinic: {
        name: clinic?.clinicName || "N/A",
        address: clinic?.clinicAddress || "N/A",
        city: clinic?.clinicCity || "N/A",
        area: clinic?.clinicArea || "N/A",
        price: clinic?.Price || 0
      },
      payment: {
        basePrice: appointment.Price || 0,
        taxAmount: appointment.receipt.taxAmount || 0,
        totalAmount: appointment.receipt.totalAmount || 0,
        paymentMethod: appointment.receipt.paymentMethod || "N/A",
        paymentDetails: appointment.receipt.paymentDetails || {}
      }
    };

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      message: "Receipt details retrieved successfully",
      data: receiptData
    });

  } catch (err) {
    console.log("Error in getReceiptDetails:", err);
    errorHandler(res, err);
  }
};


export default {
  createAppointemnt,
  getAppointments,
  updateAppointment,
  cancelAppointment,
  createFollowUpAppointment,
  deleteAppointment,
  getReceiptDetails
};
