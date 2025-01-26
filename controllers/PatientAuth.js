import Patient from "./../models/PatientAuth_Model.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import responseMsgs from "./../utilities/responseMsgs.js";
import errorHandler from "./../utilities/errorHandler.js";
import nodemailer from "nodemailer";


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
    res.status(201).json({
      status: responseMsgs.SUCCESS,
      data: "SignUp Successfully",
    });
  } catch (er) {
    console.log(er);
    errorHandler(res, er);
  }
};

const login = async (req, res) => {
  try {
    let credetials = req.body;
    let getPatient = await Patient.findOne({ userEmail: credetials.userEmail });
    if (!getPatient) {
      throw "User Not Found";
    }

    let checkPassword = await bcrypt.compare(
      credetials.userPassword,
      getPatient.userPassword
    );
    if (!checkPassword) {
      throw "Wrong Password";
    }

    const patientData = {
      userEmail: getPatient.userEmail,
      userName: getPatient.userName,
      userPhone: getPatient.userPhone,
    };

    let token = jwt.sign({
        email : getPatient.userEmail,
        name : getPatient.userName
    }, process.env.jwtKey);
    res.status(200).cookie("jwt", token).json({
      status: responseMsgs.SUCCESS,
      data: "Loged In Successfully",
      patient: patientData,
    });
  } catch (er) {
    console.log(er);
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

    const token = jwt.sign({ email: userEmail }, process.env.jwtKey, {
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

    const decoded = jwt.verify(token, process.env.jwtKey);
    const email = decoded.email;

    const patient = await Patient.findOne({ userEmail: email });
    if (!patient) {
      throw "User Not Found";
    }

    const hashedPassword = await bcrypt.hash(newPassword, 6);

    const update = await Patient.updateOne(
      { userEmail: email },
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

    const decoded = jwt.verify(token, process.env.jwtKey);
    const email = decoded.email;

    const patient = await Patient.findOne({ userEmail: email });
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
        profileImage: patient.profileImage
      }
    });
  } catch (err) {
    console.log(err);
    errorHandler(res, err);
  }
};

export default {
  register,
  login,
  forgetpassword,
  resetPassword,
  verifyotp,
  updateProfilePicture,
};
