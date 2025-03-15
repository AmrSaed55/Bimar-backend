import Patient from "./../models/PatientAuth_Model.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import responseMsgs from "./../utilities/responseMsgs.js";
import errorHandler from "./../utilities/errorHandler.js";
import generateTokenAndSetCookie from "./../utilities/generateToken.js";

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const register = async (req, res) => {
  try {
    let newPatientData = req.body;

    let validationError = validationResult(req);
    if (!validationError.isEmpty()) {
      throw validationError;
    }

    let hashedPassword = await bcrypt.hash(newPatientData.userPassword, 6);
    let addPatient = await Patient.create({
      ...newPatientData,
      userPassword: hashedPassword,
    });

    if (addPatient) {
      generateTokenAndSetCookie(addPatient._id, "Patient", res);
      res.status(201).json({
        status: responseMsgs.SUCCESS,
        data: "SignUp Successfully",
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (er) {
    console.log("Error in register controller", er.message);
    errorHandler(res, er);
  }
};

const login = async (req, res) => {
  try {
    let credentials = req.body;
    let getPatient = await Patient.findOne({
      userEmail: credentials.userEmail,
    });
    if (!getPatient) {
      return res.status(400).json({ error: "User not found" });
    }

    let checkPassword = await bcrypt.compare(
      credentials.userPassword,
      getPatient.userPassword
    );
    if (!checkPassword) {
      return res.status(400).json({ error: "wrong password" });
    }

    const patientData = {
      id: getPatient._id,
      userEmail: getPatient.userEmail,
      userName: getPatient.userName,
      userPhone: getPatient.userPhone,
      userHeight: getPatient.personalRecords.userHeight,
      userWeight: getPatient.personalRecords.userWeight,
      DateOfBirth: getPatient.personalRecords.DateOfBirth,
      Gender: getPatient.personalRecords.Gender,
      City: getPatient.personalRecords.City,
      Area: getPatient.personalRecords.Area,
      bloodType: getPatient.medicalRecord.bloodType,
    };

    generateTokenAndSetCookie(getPatient._id, "Patient", res);

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: "Logged In Successfully",
      patient: patientData,
    });
  } catch (er) {
    console.log("Error in login controller", er.message);
    errorHandler(res, er);
  }
};

const generateOtp = () => {
  return Math.floor(10000 + Math.random() * 90000);
};

const forgetpassword = async (req, res) => {
  try {
    const { userEmail } = req.body;
    const patient = await Patient.findOne({ userEmail });
    if (!patient) {
      throw "User With This Email does not exist";
    }

    const otp = generateOtp();
    const userName = patient.userName;

    const token = jwt.sign({ email: userEmail }, process.env.JWT_KEY, {
      expiresIn: "10m",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: process.env.email_port,
      auth: {
        user: process.env.user,
        pass: process.env.pass,
      },
    });

    const mailOptions = {
      from: "bimar.med24@gmail.com",
      to: userEmail,
      subject: "Password Reset OTP",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #F0F4F9; padding: 40px;">
            <!-- Email Container -->
            <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); overflow: hidden; width: 100%;">

                <!-- Header Section -->
                <div style="background-color: #16423C; padding: 30px; text-align: center;">
                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 0; font-weight: bold;">🔒 Password Reset</h1>
                </div>

                <!-- Content Section -->
                <div style="padding: 30px;">
                    <h2 style="color: #333; font-size: 22px; margin-bottom: 15px;">Hello, ${userName} 👋</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        We've received a request to reset your password. Use OTP below to complete the process securely:
                    </p>
                    <div style="text-align: center; margin: 25px 0;">
                        <span style="display: inline-block; background-color: #F0F4F9; color: #16423C; font-size: 28px; font-weight: bold; padding: 15px 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            ${otp}
                        </span>
                    </div>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        This OTP is valid for <strong>10 minutes</strong>. If you did not request this action, you can safely ignore this email.
                    </p>
                </div>

                <!-- Footer Section -->
                <div style="background-color: #E1DEDE; text-align: center; padding: 20px; font-size: 14px; color: #777;">
                    <p style="margin: 0;">
                        Need help? Contact us at
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

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.log("Error:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.cookie("otp", otp, {
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
    });

    res.status(200).cookie("jwt", token).json({
      status: responseMsgs.SUCCESS,
      data: "OTP sent to your email",
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

const verifyotp = async (req, res) => {
  try {
    const { otp } = req.body;
    const storedOtp = req.cookies.otp;

    if (!storedOtp) {
      throw " OTP has expired or does not exist ";
    }

    if (storedOtp !== otp) {
      return res.status(400).json({
        status: responseMsgs.FAILURE,
        data: "Incorrect OTP. Please try again.",
      });
    }

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: "OTP verified successfully. Now you can reset your password",
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const token = req.cookies.jwt;

    if (!token) {
      throw "No Token Provided";
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const patient = await Patient.findById(decoded.userId);
    if (!patient) {
      throw "User Not Found";
    }

    const hashedPassword = await bcrypt.hash(newPassword, 6);

    const update = await Patient.updateOne(
      { _id: patient._id },
      { userPassword: hashedPassword }
    );

    res.clearCookie("otp");

    res
      .status(200)
      .json(
        update
          ? (data = "Password updated")
          : (data = "password updated failed")
      );
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      throw "No image file provided";
    }

    const token = req.cookies.jwt;
    if (!token) {
      throw "No Token Provided";
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const patient = await Patient.findById(decoded.userId);
    if (!patient) {
      throw "Patient not found";
    }

    // Update profile image path
    patient.profileImage = req.file.path;
    await patient.save();

    res.status(200).json({
      status: responseMsgs.SUCCESS,
      data: {
        message: "Profile picture updated successfully",
        profileImage: patient.profileImage,
      },
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

// Function to fetch patient data by ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params; // Extract the patient ID from the request parameters

    // Find the patient by ID
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        status: "FAILURE",
        message: "Patient not found",
      });
    }

    // Return the patient data
    res.status(200).json({
      status: "SUCCESS",
      data: patient,
    });
  } catch (error) {
    console.error("Error fetching patient data:", error);
    errorHandler(res, error);
  }
};

const UpdatePatient = async(req,res)=>{
  let id = req.params.id
  let UpdatePatientData = req.body
  
  if(UpdatePatientData.userPassword){
    let newPassword = await bcrypt.hash(UpdatePatientData.userPassword, 6)
    UpdatePatientData.userPassword = newPassword
  }
  let update = await Patient.updateOne({_id : id},UpdatePatientData)
  res.json(update ? {data :'Updated Successfulyy'} : {data : 'Something wend Wrong'})
}

// API to update FCM token for a patient
const updateFcm = async (req, res) => {
  try {
    const { patientId, fcmToken } = req.body;

    if (!patientId || !fcmToken) {
      throw "Patient ID and FCM token are required";
    }

    await Patient.findByIdAndUpdate(patientId, { fcmToken });
    res.status(200).json({ data: "FCM token updated successfully" });
  } catch (error) {
    console.log(error);
    errorHandler(res, error);
  }
};

export default {
  register,
  login,
  forgetpassword,
  resetPassword,
  verifyotp,
  updateProfilePicture,
  getPatientById,
  updateFcm,
  UpdatePatient,
};
